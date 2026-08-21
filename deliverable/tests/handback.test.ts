// A LEAVING CHECK DOES NOT HOLD THE CALL, authored test-first at i51's
// author-tests.
//
// BOTH CASES ARE RED, and neither is red by accident. The serving path awaits a
// step's leaving script inline, and the verdict it produces lives in an
// in-memory map that deletes its own entry the moment the run settles — measured
// 2026-08-21 in exp-what-a-fresh-session-sees.
//
// WHY ONE CASE READS SOURCE AND THE OTHER READS THE CLASS. The first claim is
// about a call SHAPE that no runtime value exposes: an await either stands in the
// serving path or it does not. The second is about a surface, and a surface can
// be asked what it offers.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { withJudgment } from "../engine/forms.ts";
import type { MachineDecl, StateDecl } from "../engine/machine.ts";
import { type ScriptHost, Scripts } from "../engine/sessionscript.ts";

const source = (name: string): string => readFileSync(fileURLToPath(new URL(`../engine/${name}`, import.meta.url)), "utf8");

// RED. deliverable/engine/session.ts awaits scriptRun on the tick path, so a
// step whose leaving check runs a battery freezes the pull for its whole
// duration — the defect this record exists to end.
test("the serving path does not await a step's leaving judgment", () => {
  const text = source("session.ts");
  assert.doesNotMatch(
    text,
    /await\s+this\.scripts\.scriptRun\(/,
    "the leaving judgment is awaited inline, so the call is held for as long as it runs",
  );
});

// RED. The judgment's verdict is held in a Map keyed by evidence key and the
// entry is deleted in a .finally() the moment it settles, so nothing can be
// asked where a step stands while its judgment is still being reached.
test("a step's standing can be read while its judgment is still being reached", () => {
  const offered = Object.getOwnPropertyNames(Scripts.prototype);
  assert.ok(
    offered.some((name) => /standing/i.test(name)),
    `nothing on the scripts surface answers where a step stands, so a pending verdict is attached to nothing: ${JSON.stringify(offered)}`,
  );
});

// THE SET IS CLOSED, and that is the whole point. Still-deciding is not passed
// and not failed: flattened toward passed a gate opens on evidence that does
// not exist, and flattened toward failed a walk is refused for doing nothing
// wrong. A reader can only take it distinctly if the word is one of three.
test("a step's standing is one word from a closed set of three", () => {
  const source = readFileSync(fileURLToPath(new URL("../engine/sessionscript.ts", import.meta.url)), "utf8");
  const declared = /scriptStanding\([^)]*\):\s*([^{]+)\{/.exec(source)?.[1] ?? "";
  for (const word of ['"passed"', '"not passed"', '"deciding"']) {
    assert.ok(declared.includes(word), `the standing offers ${word}: ${declared.trim()}`);
  }
  const offered = declared.match(/"[a-z ]+"/g) ?? [];
  assert.equal(offered.length, 3, `and nothing else: ${JSON.stringify(offered)}`);
});

// The pull's own reader takes it. Before i51 the answer carried exit_met alone,
// which is a boolean and cannot hold three words.
test("the pull's answer carries the standing beside the boolean", () => {
  const source = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
  const sites = source.match(/exit_met: this\.conditionMet\(/g) ?? [];
  const carried = source.match(/standing: this\.stepStanding\(/g) ?? [];
  assert.ok(sites.length > 0, "the answer still computes exit_met");
  assert.equal(
    carried.length,
    sites.length,
    `every place that reports exit_met reports the standing beside it: ${String(carried.length)} of ${String(sites.length)}`,
  );
});

// THE VERDICT LANDS WHERE THE STEP'S OTHER STANDINGS LIVE. Before i51 it lived
// in a Map that deleted its own entry the moment the judgment settled, so a
// session that ended took the answer with it.
test("a settled judgment is written into the form's own frontmatter", () => {
  const raw = "---\nform: verification\nby: agent\nsigned_off: 2026-08-21\nauthors: agent\n---\n\n# body\n";
  const written = withJudgment(raw, "passed", "2026-08-21T11:00:00.000Z");
  assert.match(written, /^judgment: passed at 2026-08-21T11:00:00\.000Z$/m, `the verdict is on the file: ${written}`);
  assert.match(written, /^signed_off: 2026-08-21$/m, "and the signature is untouched");
});

// A judgment that keeps agreeing with itself never rewrites the file. Most
// pulls re-reach the same verdict, and a write per pull would dirty the tree
// for nothing.
test("a verdict that has not changed leaves the file alone", () => {
  const raw = "---\nform: verification\njudgment: passed at 2026-08-21T11:00:00.000Z\n---\n";
  assert.equal(withJudgment(raw, "passed", "2026-08-21T12:00:00.000Z"), raw, "the same verdict at a later clock is not a change");
});

test("a verdict that changed replaces the one on the file", () => {
  const raw = "---\nform: verification\njudgment: passed at 2026-08-21T11:00:00.000Z\n---\n";
  const written = withJudgment(raw, "not passed", "2026-08-21T12:00:00.000Z");
  assert.match(written, /^judgment: not passed at 2026-08-21T12:00:00\.000Z$/m, `the newer verdict stands: ${written}`);
  assert.doesNotMatch(written, /judgment: passed at/, "and the older one is gone rather than beside it");
});

/** A walk with nothing running and nothing recorded — what a session that has
 *  just opened the project actually holds. */
function freshScripts(): { scripts: Scripts; machine: MachineDecl; state: StateDecl } {
  const state = { id: "verification", exit: { script: ["check.ts"] } } as unknown as StateDecl;
  const machine = { id: "i51", states: [state] } as unknown as MachineDecl;
  const host: ScriptHost = {
    workRoot: () => ".",
    machineRoot: () => ".",
    assertStanding: () => {},
    leaves: () => ({ machine, ids: [state.id] }),
    state: () => state,
    notifyChange: () => {},
    recordVerdict: () => {},
    evidence: new Map<string, Record<string, unknown>>(),
  };
  return { scripts: new Scripts(host), machine, state };
}

// THE FATAL RISK, CLOSED BY CONSTRUCTION. raid-ar-walk-resumes-from-repo says a
// step left deciding when a session ends has a word the repository cannot
// settle. Nothing ever WRITES that word: only a settled verdict reaches disk,
// and the third standing comes from an in-memory map a fresh process starts
// empty. So a fresh session cannot find a step deciding, and re-runs instead.
test("a fresh session never finds a step deciding, so it re-runs the judgment", () => {
  const { scripts, machine, state } = freshScripts();
  assert.notEqual(scripts.scriptStanding(machine, state), "deciding", "a process that started nothing has nothing in flight to report");
  assert.equal(scripts.scriptStanding(machine, state), "not passed", "and not-passed is what sends the walk to run the judgment again");
});

// The other half of the same guarantee: what reaches disk is only ever settled.
test("only a settled verdict is ever written to a form", () => {
  const raw = "---\nform: verification\n---\n";
  for (const verdict of ["passed", "not passed"]) {
    assert.match(withJudgment(raw, verdict, "2026-08-21T11:00:00.000Z"), /^judgment: (passed|not passed) at /m);
  }
  const source = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
  assert.match(
    source,
    /withJudgment\(raw, ok \? "passed" : "not passed"/,
    "the only caller passes a boolean, so deciding can never reach the file",
  );
});

// THE TIMING CASE, and it is the one this file did not have. Every case above
// reads source text or asks a class what it offers; not one measures elapsed
// time, so nothing here would have caught a call returning at 1000ms, at
// 1500ms, or at sixty-eight seconds.
//
// tsp-a-leaving-check-hands-the-call-back parked it: "A timing case — that the
// call returns inside a second while a long judgment runs — waits for the
// mechanism to exist." The mechanism exists now, so the reason has expired.
//
// AND IT IS WHAT THE REQUIREMENT ACTUALLY MEASURES.
// req-a-leaving-check-does-not-hold-the-call: "the answering call returns in
// under 1 second, on every leaving check, whatever the check's own duration".
// A bound of exactly 1000 could not meet that: a timer fires at or after its
// delay, never before, with the condition loop still to run after it.
test("the call answers in under a second while a long judgment is still running", async () => {
  const lab = mkdtempSync(join(tmpdir(), "se-slow-"));
  writeFileSync(join(lab, "slow.mjs"), "await new Promise((r) => setTimeout(r, 2000));\n", "utf8");
  const slow = { id: "verification", exit: { script: ["slow.mjs"] } } as unknown as StateDecl;
  const box = { id: "i51", states: [slow] } as unknown as MachineDecl;
  const host: ScriptHost = {
    workRoot: () => lab,
    machineRoot: () => lab,
    assertStanding: () => {},
    leaves: () => ({ machine: box, ids: [slow.id] }),
    state: () => slow,
    notifyChange: () => {},
    recordVerdict: () => {},
    evidence: new Map<string, Record<string, unknown>>(),
  };
  const scripts = new Scripts(host);
  // THE SKIP WOULD MAKE THIS PASS WITHOUT MEASURING ANYTHING. With it set the
  // judgment returns instantly and the clock proves nothing about the bound.
  const skip = process.env.SE_SCRIPT_SKIP;
  delete process.env.SE_SCRIPT_SKIP;
  try {
    const at = Date.now();
    await scripts.scriptSettleWithin(slow.id, 900);
    const took = Date.now() - at;
    assert.ok(took < 1000, `the answering call must return in UNDER a second whatever the check's own duration; it took ${String(took)}ms`);
    assert.equal(scripts.scriptStanding(box, slow), "deciding", "and the step says its judgment is still being reached");
  } finally {
    if (skip === undefined) delete process.env.SE_SCRIPT_SKIP;
    else process.env.SE_SCRIPT_SKIP = skip;
    rmSync(lab, { recursive: true, force: true });
  }
});
