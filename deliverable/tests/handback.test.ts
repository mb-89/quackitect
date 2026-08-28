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
import { workAccount } from "../engine/run.ts";
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
 *  just opened the project actually holds.
 *
 *  `onDisk` is the verdict standing on the step's own form, which is what
 *  survives the process that reached it. Left out, the form carries none.
 *
 *  THE FIXTURE'S SCRIPT DOES NOT EXIST, and the stamp for a missing script is
 *  `<path>@gone`. That is what a caller passes to say the scripts have not
 *  moved since the verdict was reached. */
function freshScripts(onDisk?: { verdict: string; stamp: string }): { scripts: Scripts; machine: MachineDecl; state: StateDecl } {
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
    standingJudgment: () => onDisk,
    evidence: new Map<string, Record<string, unknown>>(),
  };
  return { scripts: new Scripts(host), machine, state };
}

// THE LAUNCHER AND THE CHECKER READ ONE VERDICT, NEVER TWO. The launcher
// declines to re-run a judgment whose verdict stands on the form. A checker
// reading only its own memory called that same step not-passed, so the walk was
// refused for a hop nothing was ever going to run again.
//
// WHAT IT COST: after a reload, no record could be re-entered past the first
// state whose exit script had already passed. There is no fallback edge there
// and no write verb, so the walk had nowhere to go.
test("a verdict standing on the form is read by the checker, not only by the launcher", () => {
  const { scripts, machine, state } = freshScripts({ verdict: "passed", stamp: "check.ts@gone" });
  assert.equal(scripts.scriptStart(state.id, true), undefined, "the launcher skips a judgment whose verdict already stands on the form");
  assert.equal(
    scripts.scriptStanding(machine, state),
    "passed",
    "so the checker reads that same verdict rather than answering from an empty memory",
  );
});

// The other direction of the same rule. A verdict reached against different
// scripts answers a different question, so it carries nothing forward.
//
// NOTHING IS STARTED HERE, on purpose. A launched run makes the standing read
// `deciding`, which is a true answer about a different moment and would hide
// the one this case is about.
test("a form verdict reached with different scripts does not stand", () => {
  const { scripts, machine, state } = freshScripts({ verdict: "passed", stamp: "check.ts@something-else" });
  assert.equal(
    scripts.scriptStanding(machine, state),
    "not passed",
    "the checker refuses a verdict reached against scripts that have since moved",
  );
});

// And a verdict the form carries as FAILED never reads as passed, whatever the
// stamp says. Only `passed` carries.
test("a failed verdict on the form is not read as passed", () => {
  const { scripts, machine, state } = freshScripts({ verdict: "not passed", stamp: "check.ts@gone" });
  assert.equal(scripts.scriptStanding(machine, state), "not passed", "a red on the form stays red");
});

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
    standingJudgment: () => undefined,
    evidence: new Map<string, Record<string, unknown>>(),
  };
  const scripts = new Scripts(host);
  // THE BOUND COMES FROM THE SERVING PATH'S OWN CONSTANT, never a copy. A
  // duplicated literal here lets that number rise back to 1000 with this case
  // still passing, which is the exact regression the case exists to catch.
  // It is read from the source rather than imported so this file keeps testing
  // session.ts without loading it.
  const declared = source("session.ts").match(/export const JUDGMENT_HANDBACK_MS = (\d+);/);
  assert.ok(declared !== null, "the bound is a named exported constant, so a test can hold it to the measure");
  const bound = Number(declared[1]);
  assert.ok(
    bound < 1000,
    `the bound must sit under the second the measure names, with room for the rest of the call; it is ${String(bound)}ms`,
  );
  // THE SKIP WOULD MAKE THIS PASS WITHOUT MEASURING ANYTHING. With it set the
  // judgment returns instantly and the clock proves nothing about the bound.
  const skip = process.env.SE_SCRIPT_SKIP;
  delete process.env.SE_SCRIPT_SKIP;
  try {
    const at = Date.now();
    await scripts.scriptSettleWithin(slow.id, bound);
    const took = Date.now() - at;
    assert.ok(took < 1000, `the answering call must return in UNDER a second whatever the check's own duration; it took ${String(took)}ms`);
    assert.equal(scripts.scriptStanding(box, slow), "deciding", "and the step says its judgment is still being reached");
  } finally {
    if (skip === undefined) delete process.env.SE_SCRIPT_SKIP;
    else process.env.SE_SCRIPT_SKIP = skip;
    // The 2000ms script is still running past the 1000ms bound this case
    // means to prove, so on Windows the directory can still be held open
    // when teardown runs. Retry briefly rather than failing on a race the
    // test itself set up on purpose.
    for (let i = 0; i < 20; i++) {
      try {
        rmSync(lab, { recursive: true, force: true });
        break;
      } catch {
        // A throw from inside finally would bury whatever the try block
        // above actually decided, so this gives up quietly after ~3s.
        await new Promise((r) => setTimeout(r, 150));
      }
    }
  }
});

// THE GATE MUST ASK BOTH QUESTIONS.
// req-a-pending-verdict-is-recorded-against-its-state binds the gate row to
// "are my feeders green, AND is any of them still deciding", and names the
// consequence of asking only the first: "a gate below it reads a green it has
// not earned." The signature lands when a form stamps; the leaving judgment can
// still be running behind it.
//
// THIS READS SOURCE, and says so. Standing up a whole ClaimsHost to drive
// feedersUnsigned would be a fixture larger than the claim; what can decay here
// is the WIRING, and the wiring is what these two assertions hold.
test("the gate asks whether a feeder is still deciding, not only whether it signed", () => {
  const text = source("sessionclaims.ts");
  assert.match(text, /\|\s*"stepStanding"/, "the claims layer is given a way to ask where a step stands");
  const body = text.slice(
    text.indexOf("feedersUnsigned("),
    text.indexOf("/** see dsp-walk-machine.md#every-condition-holding-a-state-grey"),
  );
  assert.match(
    body,
    /stepStanding\([^)]*\) === "deciding"/,
    "a feeder whose leaving judgment is in flight must not count as finished, or the gate reads a green nobody earned",
  );
});

// EVERY STARTER REGISTERS, not only the walk's.
//
// The mirror's /script endpoint calls Session.scriptRun directly
// (deliverable/engine/mirror.ts line 178), which is a second way into the same
// run. Registration used to sit in scriptStart, the OTHER way in, so a judgment
// started from the surface set its step to `deciding` while the account showed
// nothing running at all.
//
// req-one-call-reports-every-piece-of-work-out-of-sight says EVERY piece. A
// second caller that skips the table breaks that promise for the one work kind
// the account was built for. Measured on i51's own verification: a live battery
// process, and the account reporting that judgment settled 92 seconds earlier.
test("a judgment started outside the walk still enters the account", async () => {
  const lab = mkdtempSync(join(tmpdir(), "se-surface-"));
  writeFileSync(join(lab, "slow.mjs"), "await new Promise((r) => setTimeout(r, 1200));\n", "utf8");
  const slow = { id: "verification", exit: { script: ["slow.mjs"] } } as unknown as StateDecl;
  const box = { id: "surface", states: [slow] } as unknown as MachineDecl;
  const host: ScriptHost = {
    workRoot: () => lab,
    machineRoot: () => lab,
    assertStanding: () => {},
    leaves: () => ({ machine: box, ids: [slow.id] }),
    state: () => slow,
    notifyChange: () => {},
    recordVerdict: () => {},
    standingJudgment: () => undefined,
    evidence: new Map<string, Record<string, unknown>>(),
  };
  const scripts = new Scripts(host);
  // The skip would settle the run before the account is ever looked at, and the
  // case would pass without a running judgment existing.
  const skip = process.env.SE_SCRIPT_SKIP;
  delete process.env.SE_SCRIPT_SKIP;
  try {
    const run = scripts.scriptRun(slow.id); // the mirror's own path, never scriptStart
    const seen = workAccount(lab).find((r) => r.job === "judgment-surface-verification");
    assert.equal(seen?.standing, "running", "a judgment the surface started reads as running in the account");
    await run;
    const after = workAccount(lab).find((r) => r.job === "judgment-surface-verification");
    assert.equal(after?.running, false, "and it settles in the same entry rather than vanishing");
  } finally {
    if (skip === undefined) delete process.env.SE_SCRIPT_SKIP;
    else process.env.SE_SCRIPT_SKIP = skip;
    rmSync(lab, { recursive: true, force: true });
  }
});

/** A scripts surface whose host carries the standing judgment this case wants.
 *  The fixture above hardcodes none, and none is one of the three answers. */
function scriptsStanding(judgment: { verdict: string; stamp: string } | undefined): {
  scripts: Scripts;
  machine: MachineDecl;
  state: StateDecl;
} {
  const state = { id: "verification", exit: { script: ["check.ts"] } } as unknown as StateDecl;
  const machine = { id: "i54", states: [state] } as unknown as MachineDecl;
  const host = {
    workRoot: () => ".",
    machineRoot: () => ".",
    assertStanding: () => {},
    leaves: () => ({ machine, ids: [state.id] }),
    state: () => state,
    notifyChange: () => {},
    recordVerdict: () => {},
    standingJudgment: () => judgment,
    evidence: new Map<string, Record<string, unknown>>(),
  } as unknown as ScriptHost;
  return { scripts: new Scripts(host), machine, state };
}

// TWO READERS OF ONE TRUTH, AND THEY HAVE TO READ THE SAME STORE.
//
// The runner skips a re-run when the standing judgment ON DISK passed against
// these same scripts. The checker asked only the IN-MEMORY evidence, which a
// reload empties. So a re-entered record could not leave ANY state whose exit
// carries a script: the runner said nothing needed running and the checker said
// nothing had run, forever.
//
// MEASURED on the walk that found it: fourteen script-carrying hops, each
// refused with `not run yet` while the script exited 0 when run by hand, and
// `se_why` reported the state standing with no blockers.
test("a passed judgment on disk answers the checker, not only the runner", () => {
  const { scripts, machine, state } = scriptsStanding({ verdict: "passed", stamp: "check.ts@gone" });
  assert.equal(
    scripts.scriptPassedOnDisk(machine, state),
    true,
    "a verdict that outlived the process still covers the hop, or a reloaded session can never leave this state",
  );
});

// AND IT CANNOT GREEN A STALE ONE. The stamp is the whole guard: a verdict
// reached against different scripts is a verdict about a different question.
test("a judgment reached against different scripts does not answer for these", () => {
  const { scripts, machine, state } = scriptsStanding({ verdict: "passed", stamp: "check.ts@0000" });
  assert.equal(scripts.scriptPassedOnDisk(machine, state), false, "a different stamp is a different question and re-runs");
  const none = scriptsStanding(undefined);
  assert.equal(none.scripts.scriptPassedOnDisk(none.machine, none.state), false, "and no judgment at all leans on nothing");
});

// THE CHECKER MUST ACTUALLY ASK. Deleting the one line restores the pin with
// both cases above still passing, which is the regression this catches.
//
// THE CALL IT PINS MOVED, AND THE DEMAND DID NOT. This first pinned
// `scriptPassedOnDisk`, which the checker called directly beside its own read of
// the in-memory evidence. i63 replaced that pair with ONE decider: three readers
// answered the same question from different stores, and only two of them had
// been taught that a verdict can stand on the form.
//
// `scriptStanding` IS A SUPERSET OF WHAT THIS ASKED FOR. It consults the same
// standing judgment with the same stamp comparison, and adds one answer the old
// pair could not give — `deciding`, while a run is in flight, so a stamp
// recorded green cannot carry the walk past a check that is failing right now.
//
// SO THE PIN NAMES THE NEW CALL AND THE OLD ONE STAYS TESTED, by the two cases
// above, which call `scriptPassedOnDisk` themselves.
test("the condition checker asks the runner's own question", () => {
  assert.match(
    source("session.ts"),
    /key === "script"[\s\S]{0,240}scriptStanding/,
    "conditionKeyMet reads the in-memory evidence alone again, so a reloaded session cannot leave a script-carrying state",
  );
});
