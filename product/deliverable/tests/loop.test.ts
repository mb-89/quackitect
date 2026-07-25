// B4 pass condition: a scripted walk closes a dummy iteration with no human
// and no agent. Plus: failure kinds, fallback guards, escape recording,
// evidence-form validation, run pinning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { layout } from "../engine/layout.ts";
import { loadMachine } from "../engine/machines/load.ts";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
// The drawn machine from this repo's own ledger IS the fixture: tests
// compile the real canvas, so breaking the drawing breaks the suite.
const systematic = loadMachine(join(import.meta.dirname, "..", "..", ".."), "lean")!;
import { validateMachine, type MachineDecl } from "../engine/machine.ts";
import { Rejection } from "../engine/errors.ts";

const OK = `node -e "process.exit(0)"`;
const FAIL = `node -e "process.exit(1)"`;

/** The systematic shape with a benign verify command for the walk. */
function machineWith(command: string): MachineDecl {
  return {
    ...systematic,
    states: systematic.states.map((s) => (s.id === "verify" ? { ...s, command } : s)),
  };
}

test("the systematic machine passes load-time checks", () => {
  validateMachine(systematic);
});

test("scripted walk closes a dummy iteration with no human and no agent", () => {
  const root = mkdtempSync(join(tmpdir(), "se-loop-"));
  try {
    const loop = new Loop(root, machineWith(OK));

    // No iteration: next instructs, never errors.
    assert.equal(loop.next().kind, "instruction");

    let p = loop.start("i0-dummy");
    assert.equal(p.state, "declare_goal");
    assert.ok(p.guidance && p.evidence_form!.length === 3);

    p = loop.submit({
      goal: "close a dummy iteration end to end",
      load_bearing_for: "B4 pass condition",
      exit_check: "instance status closed with verify evidence pinned",
    });
    assert.equal(p.state, "do_work");

    // do_work -> verify: verify is engine-filled and closes mechanically.
    p = loop.submit({ changed: "nothing - dummy walk" });
    assert.equal(p.kind, "gate");
    assert.equal(p.state, "close_iteration");
    assert.equal(p.auto_closed!.length, 1);
    assert.equal(p.auto_closed![0].state, "verify");
    assert.equal(p.auto_closed![0].ok, true);

    // Gate submit creates an OFFER (B5): the bless arrives through a channel
    // the agent doesn't control. The script plays the human via the gate API,
    // channel recorded as scripted (delegated adjudication, transparent).
    // i12: every gate carries the four standard review rounds, injected by the
    // compiler and REFUSED if absent (SE-C-030). A scripted walk fills them the
    // way a trivial gate should — scale to size, but never blank.
    p = loop.submit({
      exit_check_result: "closed; verify ran mechanically with exit 0",
      verify_round: "the one input state (do_work) delivered; its evidence matches its claim",
      validate_round: "meets the dummy walk's only intent: close mechanically with no human and no agent",
      redteam_round: "kill-criterion: the walk closes without the engine-filled verify actually running. Looked: auto_closed records verify with ok true. Trivial gate, no further opposing case",
      verdict: "pass",
    });
    assert.equal(p.kind, "gate_offered");
    assert.ok(p.offer_hash);
    const gate = new Gate(root);
    const grant = gate.bless(machineWith(OK), p.offer_hash!, { channel: "scripted", adjudicated_by: "b4-walk-test" });
    assert.equal(grant.channel, "scripted");
    // The bless closed the iteration; next() is back to the instruction state.
    assert.equal(loop.next().kind, "instruction");

    // Machine state is on the branch: the instance file exists and is closed.
    const inst = JSON.parse(readFileSync(layout.instancePath(root, "i0-dummy"), "utf8"));
    assert.equal(inst.status, "closed");
    assert.equal(inst.machine, "lean"); // floor flag 1: policy in force
    // Evidence pinned per step, including the engine-run verify.
    const evDir = layout.evidenceDir(root, "i0-dummy");
    const evidence = readdirSync(evDir);
    assert.equal(evidence.length, 4);
    const verifyEv = JSON.parse(readFileSync(join(evDir, evidence.find((f) => f.includes("verify"))!), "utf8"));
    assert.ok(verifyEv.pinned_run.ref.startsWith("run-"), "the run record is pinned into evidence");
    // The raw run landed in the call log.
    assert.ok(readFileSync(join(layout.seDir(root), "calls.jsonl"), "utf8").includes(verifyEv.pinned_run.ref));
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("a failing engine state is a normal Failed: fallback reopens, then escape records the guard", () => {
  const root = mkdtempSync(join(tmpdir(), "se-loop-fail-"));
  try {
    const loop = new Loop(root, machineWith(FAIL));
    loop.start("i0-fail");
    loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });

    // Attempts 1..2: verify fails, fallback edge (guard verify_attempts < 3)
    // reopens do_work.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const p = loop.submit({ changed: `attempt ${attempt}` });
      assert.equal(p.state, "do_work", `attempt ${attempt} should reopen do_work`);
      assert.equal(p.auto_closed![0].ok, false);
    }
    // Attempt 3: guard exhausted -> escape, recorded with the guard.
    const p = loop.submit({ changed: "attempt 3" });
    assert.equal(p.kind, "escaped");
    assert.match(p.note!, /verify_attempts < 3/);
    const inst = JSON.parse(readFileSync(layout.instancePath(root, "i0-fail"), "utf8"));
    assert.equal(inst.escapes.length, 1);
    assert.match(inst.escapes[0].exhausted_guard, /verify_attempts/);
    assert.equal(inst.counters.verify_attempts, 3);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("evidence-form validation is field-targeted and one-turn recoverable (SE-C-030)", () => {
  const root = mkdtempSync(join(tmpdir(), "se-loop-val-"));
  try {
    const loop = new Loop(root, machineWith(OK));
    loop.start("i0-val");
    let rejection: Rejection | undefined;
    try {
      loop.submit({ goal: "only the goal" });
    } catch (e) {
      rejection = e as Rejection;
    }
    assert.ok(rejection instanceof Rejection);
    assert.equal(rejection.clause, "SE-C-030");
    assert.match(rejection.expected, /load_bearing_for/);
    assert.match(rejection.expected, /exit_check/);
    const remedyEvidence = (rejection.remedy.args as { evidence: Record<string, string> }).evidence;
    assert.equal(remedyEvidence.goal, "only the goal", "remedy preserves what was already filled");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("a BOM-prefixed instance file still parses", () => {
  const root = mkdtempSync(join(tmpdir(), "se-loop-bom-"));
  try {
    const loop = new Loop(root, machineWith(OK));
    loop.start("i0-bom");
    const instPath = layout.instancePath(root, "i0-bom");
    writeFileSync(instPath, String.fromCharCode(0xfeff) + readFileSync(instPath, "utf8"), "utf8");
    const p = loop.next();
    assert.equal(p.state, "declare_goal");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("one open iteration per worktree (SE-C-031); abandon is terminal and recorded", () => {
  const root = mkdtempSync(join(tmpdir(), "se-loop-two-"));
  try {
    const loop = new Loop(root, machineWith(OK));
    loop.start("i0-a");
    assert.throws(
      () => loop.start("i0-b"),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-031",
    );
    const p = loop.abandon("scope changed");
    assert.equal(p.kind, "instruction");
    const instPath = layout.instancePath(root, "i0-a");
    const inst = JSON.parse(readFileSync(instPath, "utf8"));
    assert.equal(inst.status, "abandoned");
    assert.equal(inst.history.at(-1).evidence, "scope changed");
    assert.ok(existsSync(instPath));
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
