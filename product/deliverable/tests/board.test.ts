// The board: serves the page and the projection, and carries the owner's
// bless act on the board channel. Spawned real, ephemeral port.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { Loop } from "../engine/loop.ts";
import { layout } from "../engine/layout.ts";
import { loadMachine } from "../engine/machines/load.ts";
import type { MachineDecl } from "../engine/machine.ts";

const systematic = loadMachine(join(import.meta.dirname, "..", "..", ".."), "lean")!;
import { plantMachines, ROUNDS } from "./fixtures.ts";

const OK = `node -e "process.exit(0)"`;
const machineOK = (): MachineDecl => ({
  ...systematic,
  states: systematic.states.map((s) => (s.id === "verify" ? { ...s, command: OK } : s)),
});

async function startBoard(root: string): Promise<{ proc: ChildProcess; url: string }> {
  const bin = join(import.meta.dirname, "..", "bin", "se-board.ts");
  const proc = spawn(process.execPath, [bin, "--root", root, "--port", "0", "--no-open"], { stdio: ["ignore", "pipe", "pipe"] });
  let out = "";
  const url = await new Promise<string>((res, rej) => {
    const t = setTimeout(() => rej(new Error(`board did not announce: ${out}`)), 10_000);
    proc.stdout!.on("data", (d: Buffer) => {
      out += d.toString();
      const m = out.match(/(http:\/\/localhost:\d+\/)/);
      if (m) {
        clearTimeout(t);
        res(m[1]);
      }
    });
  });
  return { proc, url };
}

test("board serves page + projection, and the bless button closes the gate on the board channel", async () => {
  const root = mkdtempSync(join(tmpdir(), "se-board-"));
  let proc: ChildProcess | undefined;
  try {
    plantMachines(root);
    writeFileSync(join(root, "product.json"), JSON.stringify({ product: "board-fixture" }) + "\n", "utf8");
    const loop = new Loop(root, machineOK());
    loop.start("i0-board");
    loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
    loop.submit({ changed: "c" });
    const offered = loop.submit({ exit_check_result: "done", ...ROUNDS }); // i12: a gate carries its four rounds or is refused
    assert.equal(offered.kind, "gate_offered");

    const started = await startBoard(root);
    proc = started.proc;

    const page = await (await fetch(started.url)).text();
    assert.match(page, /State machine/);
    assert.match(page, /train of thought/);

    // No viewer yet: a poke would open a tab (suppressed by --no-open here).
    const cold = (await (await fetch(started.url + "open", { method: "POST" })).json()) as { viewer_recent: boolean };
    assert.equal(cold.viewer_recent, false);

    const state = (await (await fetch(started.url + "state.json")).json()) as {
      product: string;
      offer: { base_hash: string } | null;
      open_iteration: string | null;
    };
    assert.equal(state.product, "board-fixture");
    assert.equal(state.open_iteration, "i0-board");
    assert.equal(state.offer?.base_hash, offered.offer_hash);

    // The state fetch counts as a live viewer: a poke now opens nothing.
    const warm = (await (await fetch(started.url + "open", { method: "POST" })).json()) as { viewer_recent: boolean; opened: boolean };
    assert.equal(warm.viewer_recent, true);
    assert.equal(warm.opened, false);

    const bless = await fetch(started.url + "bless", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hash: offered.offer_hash }),
    });
    const blessed = (await bless.json()) as { blessed: boolean; grant: { channel: string; adjudicated_by: string } };
    assert.equal(blessed.blessed, true);
    assert.equal(blessed.grant.channel, "board");
    assert.equal(blessed.grant.adjudicated_by, "owner");

    const inst = JSON.parse(readFileSync(layout.instancePath(root, "i0-board"), "utf8")) as { status: string };
    assert.equal(inst.status, "closed");
    assert.ok(existsSync(layout.grantsPath(root)));

    // A stale second bless is a clean 409, not a crash.
    const again = await fetch(started.url + "bless", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hash: offered.offer_hash }),
    });
    assert.equal(again.status, 409);
  } finally {
    proc?.kill();
    if (proc) await once(proc, "exit").catch(() => {});
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
