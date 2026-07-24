// B5 pass condition: a console bless lands with channel + hash on the grant
// record. Plus: the toll (refuse-once with schema inline), se.help logged
// misses, se.wait mechanical conditions, offer expiry as dismissal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { Toll } from "../engine/toll.ts";
import { CallLog } from "../engine/calllog.ts";
import { help } from "../engine/help.ts";
import { seWait } from "../engine/wait.ts";
import { coreTools } from "../engine/tools.ts";
import { layout } from "../engine/layout.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";
import { Rejection } from "../engine/errors.ts";
import type { MachineDecl } from "../engine/machine.ts";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
const systematic = loadMachine(join(import.meta.dirname, "..", "..", ".."), "lean")!;

const OK = `node -e "process.exit(0)"`;

function machineOK(): MachineDecl {
  return { ...systematic, states: systematic.states.map((s) => (s.id === "verify" ? { ...s, command: OK } : s)) };
}

/** Drive an iteration to the gate offer; returns the offer hash. */
function reachGate(root: string): string {
  plantMachines(root);
  const loop = new Loop(root, machineOK());
  loop.start("i0-gate");
  loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
  loop.submit({ changed: "c" });
  const p = loop.submit({ exit_check_result: "done" });
  assert.equal(p.kind, "gate_offered");
  return p.offer_hash!;
}

test("B5 pass: a console bless lands with channel + hash on the grant record", async () => {
  const root = mkdtempSync(join(tmpdir(), "se-tty-"));
  try {
    const offerHash = reachGate(root);
    // The real console lane: spawn se-gate, answer y on stdin.
    const bin = join(import.meta.dirname, "..", "bin", "se-gate.ts");
    const proc = spawn(process.execPath, [bin, "--root", root], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let answered = false;
    proc.stdout.on("data", (d: Buffer) => {
      out += d.toString();
      if (!answered && out.includes("[y/N]")) {
        answered = true;
        proc.stdin.end("y\n");
      }
    });
    const [code] = (await once(proc, "exit")) as [number];
    assert.equal(code, 0, `se-gate failed: ${out}`);
    assert.match(out, /blessed — grant recorded: channel=tty/);

    const grants = readFileSync(layout.grantsPath(root), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.equal(grants.length, 1);
    assert.equal(grants[0].channel, "tty"); // floor flag 2: channel
    assert.equal(grants[0].hash, offerHash); // bound to the offered state
    assert.ok(grants[0].adjudicated_by.length > 0); // floor flag 2: adjudicator
    assert.equal(grants[0].policy, "lean"); // floor flag 1: policy in force
    assert.match(grants[0].evidence, /evidence\/\d\d-close_iteration\.json$/); // floor flag 4: evidence pointer
    assert.equal(typeof grants[0].imports, "object"); // import stamp (fixture has no modules: empty)
    // The machine advanced through the approval edge.
    const inst = JSON.parse(readFileSync(layout.instancePath(root, "i0-gate"), "utf8"));
    assert.equal(inst.status, "closed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a stale hash cannot bless; an expired offer is dismissal by absence", () => {
  const root = mkdtempSync(join(tmpdir(), "se-offer-"));
  try {
    reachGate(root);
    const gate = new Gate(root);
    assert.throws(
      () => gate.bless(machineOK(), "0".repeat(64), { channel: "tty", adjudicated_by: "x" }),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-042",
    );
    // Expiry: a gate whose clock is past the deadline sees no offer.
    const later = new Gate(root, { now: () => Date.now() + 7 * 60 * 60 * 1000 });
    assert.equal(later.current(), null);
    assert.throws(
      () => later.bless(machineOK(), "anything", { channel: "tty", adjudicated_by: "x" }),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-041",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the toll refuses once with the schema inline, and the paid call proceeds", () => {
  const root = mkdtempSync(join(tmpdir(), "se-toll-"));
  try {
    let clock = 1_000_000;
    const seDir = join(root, ".se");
    const toll = new Toll(seDir, { windowMs: 10 * 60 * 1000, now: () => clock });
    const log = new CallLog(seDir);

    // Unarmed: no toll, ever (first call of a session pays nothing).
    toll.check("se_get_node", { id: "se.x" }, log);

    toll.arm();
    clock += 11 * 60 * 1000; // past the window

    let rejection: Rejection | undefined;
    try {
      toll.check("se_get_node", { id: "se.x" }, log);
    } catch (e) {
      rejection = e as Rejection;
    }
    assert.ok(rejection instanceof Rejection);
    assert.equal(rejection.clause, "SE-C-040");
    // The remedy IS the same call with the update schema inline.
    assert.equal(rejection.remedy.tool, "se_get_node");
    const remedyArgs = rejection.remedy.args as { id: string; update: { current_step: string } };
    assert.equal(remedyArgs.id, "se.x");
    assert.ok(remedyArgs.update.current_step);

    // Paying the toll: same call + update proceeds and resets the clock.
    toll.check("se_get_node", { id: "se.x", update: { current_step: "s", next_milestone: "m", eta: "14:00" } }, log);
    toll.check("se_get_node", { id: "se.x" }, log); // within window again

    // A harness that has not declared the update property serializes it as a
    // JSON string — the stringified form pays the toll too.
    clock += 11 * 60 * 1000;
    toll.check(
      "se_get_node",
      { id: "se.x", update: JSON.stringify({ current_step: "s2", next_milestone: "m2", eta: "14:30" }) },
      log,
    );
    toll.check("se_get_node", { id: "se.x" }, log); // within window again
    // The update landed server-side (call log).
    assert.match(readFileSync(join(seDir, "calls.jsonl"), "utf8"), /se\.toll\.update/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a chat-relayed bless lands with channel=chat and the owner as adjudicator", () => {
  const root = mkdtempSync(join(tmpdir(), "se-chat-bless-"));
  try {
    const offerHash = reachGate(root);
    const bless = coreTools(root).find((t) => t.name === "se_gate_bless")!;
    const r = bless.handler({ hash: offerHash }) as { grant: { channel: string; adjudicated_by: string } };
    assert.equal(r.grant.channel, "chat");
    assert.equal(r.grant.adjudicated_by, "owner");
    const inst = JSON.parse(readFileSync(layout.instancePath(root, "i0-gate"), "utf8"));
    assert.equal(inst.status, "closed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("se.help: hits are affordances, misses are honest refusals (the observer owns the log line)", () => {
  const root = mkdtempSync(join(tmpdir(), "se-help-"));
  try {
    const tools = coreTools(root);

    const hit = help("apply atomic operations", "bulk edit nodes", tools, systematic);
    assert.ok(hit.hits.some((h) => h.tool === "se_set_apply"));
    assert.equal(hit.refusal, undefined);

    const miss = help("deploy kubernetes cluster", "ship to prod", tools, systematic);
    assert.equal(miss.hits.length, 0);
    assert.match(miss.refusal!, /no such tool — do it yourself/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("se.wait returns on a mechanical file condition and refuses park-length waits", async () => {
  const root = mkdtempSync(join(tmpdir(), "se-wait-"));
  try {
    const target = join(root, "flag.txt");
    setTimeout(() => writeFileSync(target, "x"), 400);
    const r = await seWait(root, { kind: "file", path: target, until: "exists" }, 10);
    assert.equal(r.outcome, "condition");
    assert.ok(r.waited_ms >= 250);

    await assert.rejects(
      () => seWait(root, { kind: "offer" }, 3600),
      (e: unknown) => (e as Rejection).clause === "SE-C-050",
    );

    const t = await seWait(root, { kind: "file", path: join(root, "never.txt"), until: "exists" }, 1);
    assert.equal(t.outcome, "timeout");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("se.wait on the offer resolves when a bless lands", async () => {
  const root = mkdtempSync(join(tmpdir(), "se-wait-offer-"));
  try {
    const offerHash = reachGate(root);
    assert.ok(existsSync(layout.offerPath(root)));
    setTimeout(() => {
      new Gate(root).bless(machineOK(), offerHash, { channel: "scripted", adjudicated_by: "wait-test" });
    }, 400);
    const r = await seWait(root, { kind: "offer" }, 10);
    assert.equal(r.outcome, "condition");
    assert.match(r.detail, /offer resolved/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
