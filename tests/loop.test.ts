// B4 pass condition: a scripted walk closes a dummy iteration with no human
// and no agent. Plus: failure kinds, fallback guards, escape recording,
// evidence-form validation, run pinning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Loop } from "../engine/loop.ts";
import { systematic } from "../engine/machines/systematic.ts";
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

    p = loop.submit({ exit_check_result: "closed; verify ran mechanically with exit 0" });
    assert.equal(p.kind, "closed");

    // Machine state is on the branch: the instance file exists and is closed.
    const inst = JSON.parse(readFileSync(join(root, "state", "i0-dummy.json"), "utf8"));
    assert.equal(inst.status, "closed");
    assert.equal(inst.machine, "systematic"); // floor flag 1: policy in force
    // Evidence pinned per step, including the engine-run verify.
    const evidence = readdirSync(join(root, "evidence", "i0-dummy"));
    assert.equal(evidence.length, 4);
    const verifyEv = JSON.parse(
      readFileSync(join(root, "evidence", "i0-dummy", evidence.find((f) => f.includes("verify"))!), "utf8"),
    );
    assert.ok(verifyEv.pinned_run.ref.startsWith("run-"), "the run record is pinned into evidence");
    // The raw run landed in the call log.
    assert.ok(readFileSync(join(root, ".se", "calls.jsonl"), "utf8").includes(verifyEv.pinned_run.ref));
  } finally {
    rmSync(root, { recursive: true, force: true });
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
    const inst = JSON.parse(readFileSync(join(root, "state", "i0-fail.json"), "utf8"));
    assert.equal(inst.escapes.length, 1);
    assert.match(inst.escapes[0].exhausted_guard, /verify_attempts/);
    assert.equal(inst.counters.verify_attempts, 3);
  } finally {
    rmSync(root, { recursive: true, force: true });
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
    rmSync(root, { recursive: true, force: true });
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
    const inst = JSON.parse(readFileSync(join(root, "state", "i0-a.json"), "utf8"));
    assert.equal(inst.status, "abandoned");
    assert.equal(inst.history.at(-1).evidence, "scope changed");
    assert.ok(existsSync(join(root, "state", "i0-a.json")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
