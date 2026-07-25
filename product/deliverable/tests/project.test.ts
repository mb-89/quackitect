// The projection: pure, complete, and the single source both renderers use.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { Loop } from "../engine/loop.ts";
import { layout } from "../engine/layout.ts";
import { projectState, renderHandover } from "../engine/project.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";
import type { MachineDecl } from "../engine/machine.ts";

const systematic = loadMachine(join(import.meta.dirname, "..", "..", ".."), "lean")!;

const OK = `node -e "process.exit(0)"`;
const machineOK = (): MachineDecl => ({
  ...systematic,
  states: systematic.states.map((s) => (s.id === "verify" ? { ...s, command: OK } : s)),
});

test("projection carries product, iterations with goals and steps, offer and calls", () => {
  const root = mkdtempSync(join(tmpdir(), "se-proj-"));
  try {
    plantMachines(root);
    writeFileSync(join(root, "product.json"), JSON.stringify({ product: "proj-fixture" }) + "\n", "utf8");
    const loop = new Loop(root, machineOK());
    loop.start("i0-proj");
    loop.submit({ goal: "the projected goal", load_bearing_for: "l", exit_check: "e" });
    loop.submit({ changed: "c" });
    const p = loop.submit({ exit_check_result: "done" });
    assert.equal(p.kind, "gate_offered");

    const s = projectState(root);
    assert.equal(s.product, "proj-fixture");
    assert.equal(s.open_iteration, "i0-proj");
    assert.equal(s.iterations.length, 1);
    assert.equal(s.iterations[0].goal, "the projected goal");
    assert.ok(s.iterations[0].steps.some((st) => st.state === "verify" && st.done));
    assert.ok(s.offer !== null && s.offer.base_hash === p.offer_hash);
    assert.ok(s.last_verify?.ok);
    assert.ok(s.calls.length > 0, "the wireshark feed sees the run records");
    // An open iteration nests its machine under the session machine.
    assert.equal(s.machine_stack.length, 2);
    assert.equal(s.machine_stack[0].current, "systematic");
    assert.equal(s.machine_stack[1].id, "lean");
    assert.equal(s.machine_stack[1].current, "close_iteration");

    const handover = renderHandover(s);
    assert.match(handover, /proj-fixture/);
    assert.match(handover, /i0-proj: open at close_iteration/);
    assert.match(handover, /Pending offer/);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("planned iterations join the projection; started ids skipped; owner steps flagged; open ranks first", () => {
  const root = mkdtempSync(join(tmpdir(), "se-plan-"));
  try {
    const plansDir = join(root, "product", "spec", "iterations");
    mkdirSync(plansDir, { recursive: true });
    writeFileSync(
      join(plansDir, "plan.json"),
      JSON.stringify({
        iterations: [
          { id: "i9-future", goal: "later work", steps: [{ text: "build it" }, { text: "rule on it", owner: true }] },
          { id: "i0-started", goal: "ignored - the real record wins", steps: [] },
        ],
      }) + "\n",
      "utf8",
    );
    const loop = new Loop(root, machineOK());
    loop.start("i0-started");

    const s = projectState(root);
    assert.equal(s.iterations.filter((it) => it.id === "i0-started").length, 1);
    assert.equal(s.iterations.find((it) => it.id === "i0-started")!.status, "open");
    const planned = s.iterations.find((it) => it.id === "i9-future")!;
    assert.equal(planned.status, "planned");
    assert.equal(planned.steps.length, 2);
    assert.equal(planned.steps[1].owner, true);
    // Open work first, planned after.
    assert.equal(s.iterations[0].id, "i0-started");
    assert.equal(s.iterations[1].id, "i9-future");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("the call feed is session-scoped and carries direction data", () => {
  const root = mkdtempSync(join(tmpdir(), "se-scope-"));
  try {
    plantMachines(root);
    mkdirSync(layout.seDir(root), { recursive: true });
    const calls = [
      { ref: "run-old", ts: "2026-01-01T00:00:00.000Z", tool: "se_help", args: { intent: "stale" }, ok: true, se_version: "t", duration_ms: 1, detail: { outcome: "result" } },
      { ref: "run-new", ts: "2026-12-31T00:00:00.000Z", tool: "se_file_search", args: { intent: "fresh" }, ok: false, se_version: "t", duration_ms: 2, detail: { outcome: "rejected", response: { clause: "SE-C-060" } } },
    ];
    writeFileSync(join(layout.seDir(root), "calls.jsonl"), calls.map((c) => JSON.stringify(c)).join("\n") + "\n", "utf8");
    writeFileSync(layout.lockPath(root), JSON.stringify({ at: "2026-06-01T00:00:00.000Z" }) + "\n", "utf8");

    const s = projectState(root);
    assert.equal(s.agents[0].name, "mallard");
    assert.equal(s.session_started, "2026-06-01T00:00:00.000Z");
    // Admitted, nothing open: the session machine sits at idle, no nested frame.
    assert.equal(s.machine_stack.length, 1);
    assert.equal(s.machine_stack[0].id, "session");
    assert.equal(s.machine_stack[0].current, "idle");
    assert.equal(s.machine_stack[0].states[0].group, "boot");
    assert.equal(s.machine_stack[0].states.at(-1)!.kind, "terminal");
    assert.equal(s.calls.length, 1, "pre-session calls are filtered out");
    assert.equal(s.calls[0].intent, "fresh");
    assert.equal((s.calls[0].response as { clause: string }).clause, "SE-C-060");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("projection of an empty root is honest, not an error", () => {
  const root = mkdtempSync(join(tmpdir(), "se-proj-empty-"));
  try {
    const s = projectState(root);
    assert.equal(s.iterations.length, 0);
    assert.equal(s.offer, null);
    assert.match(renderHandover(s), /none yet/);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
