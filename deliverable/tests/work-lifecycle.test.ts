// BACKGROUND WORK REPORTS ITS OWN END, authored test-first at i62's
// author-tests and green after i62's build. Seven of the eight cases were red
// when they were written, and each still says in its own comment what it was
// red about.
//
// WHAT WAS ALREADY BUILT BEFORE THIS RECORD, so no case claims credit for it.
// `jobList` lets a settled record on disk beat a running one in memory, and
// `reapAbandonedJobs` closes what a PREVIOUS engine left behind. Neither
// covered a process that dies while this engine runs, which is what these
// cases are about.
//
// WHY THE ACCOUNT AND NOT A LANE VERB. `workAccount` is where an entry's
// standing is composed. Testing the verb that wraps it would pass the moment
// the wrapper changed shape, without the account improving.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  isRegistrationCall,
  jobList,
  openOperation,
  registrationExempt,
  releaseWorkspace,
  settleOperation,
  sweepGoneOperations,
  takeWorkspace,
  workAccount,
  workspacePort,
} from "../engine/run.ts";

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** THE REGISTRY HOLDS THE LIVE END OF WHAT IT REGISTERED. A handle names how a
 *  process ended; a number only says whether something with that number is
 *  there, and numbers are reused. */
const open = openOperation;

/** A child that outlives the case unless something kills it. */
function longChild(): { pid: number; stop: () => void } {
  const c = spawn("/bin/bash", ["-c", "sleep 30"], { detached: true, stdio: "ignore" });
  const pid = c.pid as number;
  return {
    pid,
    stop: () => {
      try {
        process.kill(-pid, "SIGKILL");
      } catch {
        /* already gone */
      }
    },
  };
}

function freshRoot(): string {
  return mkdtempSync(join(tmpdir(), "se-lifecycle-"));
}

// RED. Nothing holds the live end of a registered operation, so an entry whose
// process is gone goes on reporting itself as running. Measured 2026-08-24: a
// run reached 179 of 179 files, then said running for nineteen minutes with no
// process alive.
test("an entry whose process is gone stops reporting itself as running", async () => {
  const root = freshRoot();
  const child = longChild();
  try {
    open({ id: "op-gone-1", kind: "judgment", command: "sleep 30", root, pid: child.pid });
    child.stop();
    await wait(1500);
    const entry = workAccount(root).find((e) => e.job === "op-gone-1");
    assert.ok(entry !== undefined, "the operation is in the account");
    assert.equal(entry?.running, false, "a process that is gone leaves no entry reporting itself as running");
  } finally {
    child.stop();
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. A process that is ALIVE and quiet must be left alone. This case is the
// guard on the case above: an implementation that settles on silence rather
// than on absence passes that one and fails this one.
test("an entry whose process is alive and silent is left alone", async () => {
  const root = freshRoot();
  const child = longChild();
  try {
    open({ id: "op-alive-1", kind: "judgment", command: "sleep 30", root, pid: child.pid });
    await wait(1500);
    const entry = workAccount(root).find((e) => e.job === "op-alive-1");
    assert.equal(entry?.running, true, "silence is not evidence of death");
  } finally {
    child.stop();
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. Only a test run closes its own entry today, and it does so through a
// record on disk rather than through the exit. A judgment that exits normally
// leaves its entry open until the next engine starts.
test("a run that exits normally settles its own entry without waiting for a sweep", async () => {
  const root = freshRoot();
  const c = spawn("/bin/bash", ["-c", "exit 0"], { detached: true, stdio: "ignore" });
  try {
    // THE HANDLE, NOT THE NUMBER. Only the handle carries the exit CODE; a
    // number can say the process is gone and never how it went.
    open({ id: "op-exit-1", kind: "judgment", command: "exit 0", root, child: c });
    await wait(800);
    // THE DISCRIMINATOR. Reading the account runs the sweep, so asserting the
    // entry is settled cannot tell the two closers apart. Forcing a sweep FIRST
    // and finding nothing left to settle is what proves the exit did it.
    const swept = sweepGoneOperations(true);
    assert.ok(!swept.includes("op-exit-1"), `the exit settled it, not the sweep: ${JSON.stringify(swept)}`);
    const entry = workAccount(root).find((e) => e.job === "op-exit-1");
    assert.equal(entry?.running, false, "an ordinary exit settles the entry it belongs to");
    assert.equal(entry?.exit, 0, "and the outcome is the one the process ended with");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// GREEN TODAY, and mapped honestly rather than claimed. settleOperation returns
// early on an entry that is not running (engine/run.ts:1247), so a second
// settle cannot reopen one. The case is here because the design deliberately
// has two closers, and nothing else pins this behaviour.
test("settling an entry twice keeps the first outcome and never reopens it", () => {
  const root = freshRoot();
  try {
    open({ id: "op-twice-1", kind: "judgment", command: "true", root });
    settleOperation("op-twice-1", true, root);
    settleOperation("op-twice-1", false, root);
    const entry = jobList(root).find((j) => j.job === "op-twice-1");
    assert.equal(entry?.running, false, "the entry stays settled");
    assert.equal(entry?.exit, 0, "the first outcome stands");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. The second settle is dropped in silence, so two closers disagreeing
// about the OUTCOME look exactly like two closers agreeing. The record must
// keep the conflict even though the first outcome wins.
test("a second settle that disagrees about the outcome is recorded, not discarded", () => {
  const root = freshRoot();
  try {
    open({ id: "op-clash-1", kind: "judgment", command: "true", root });
    settleOperation("op-clash-1", true, root);
    settleOperation("op-clash-1", false, root);
    const trail = readFileSync(join(root, ".se", "jobs", "op-clash-1.conflicts.log"), "utf8");
    assert.match(trail, /conflict/, "a disagreeing settle leaves a record of the disagreement");
    // AND NOT IN THE ENTRY'S OWN LOG. That file is the entry's state of record
    // and is rebuilt from its last line, so a conflict written there would
    // replace the entry with a shell of itself.
    const own = readFileSync(join(root, ".se", "jobs", "op-clash-1.jsonl"), "utf8");
    assert.doesNotMatch(own, /conflict/, "the entry's own record is not written over");
    const entry = jobList(root).find((j) => j.job === "op-clash-1");
    assert.equal(entry?.running, false, "and the entry still reads as settled afterwards");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. An operation carries no bound, so a wait on it has no end it reaches on
// its own. A wait nobody is watching is indistinguishable from a hang, and on
// an unattended machine nobody is watching.
test("every registered operation carries the bound its wait will reach", () => {
  const root = freshRoot();
  try {
    open({ id: "op-bound-1", kind: "judgment", command: "true", root });
    const entry = jobList(root).find((j) => j.job === "op-bound-1");
    const bound = (entry as unknown as { bound_ms?: number; bound_basis?: string }) ?? {};
    assert.equal(typeof bound.bound_ms, "number", "the wait names how long it will wait");
    assert.ok(
      bound.bound_basis === "measured" || bound.bound_basis === "default",
      `the bound says whether it was measured or defaulted: ${String(bound.bound_basis)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. Nothing decides whether another instance already serves this workspace,
// so two can run on one folder and neither says so. Four processes were
// observed on one machine, 2026-08-24, in two parent-and-child pairs started 47
// seconds apart with identical arguments.
test("a workspace is taken by one instance and a second is told which folder is held", async () => {
  const root = freshRoot();
  try {
    const first = await takeWorkspace(root);
    const second = await takeWorkspace(root);
    assert.equal(first.held, true, "the first take succeeds");
    assert.equal(second.held, false, "the second take is refused");
    assert.ok(typeof second.by === "string" && second.by.length > 0, "and it says what is holding the workspace");
  } finally {
    releaseWorkspace(root);
    rmSync(root, { recursive: true, force: true });
  }
});

// THE REFUSAL THAT MATTERS IS ACROSS PROCESSES, and the case above cannot reach
// it: the second call is answered from this process's own memory, one line
// after the first put it there. Only a real second holder exercises the bind.
test("a workspace held by another process refuses the take by the bind itself", async () => {
  const root = freshRoot();
  const port = workspacePort(root);
  const holder = spawn(
    process.execPath,
    ["-e", `require('net').createServer().listen(${port},'127.0.0.1',()=>process.stdout.write('up'));setInterval(()=>{},1000)`],
    { detached: true, stdio: ["ignore", "pipe", "ignore"] },
  );
  try {
    await new Promise<void>((resolve) => {
      holder.stdout?.on("data", () => resolve());
      setTimeout(resolve, 3000);
    });
    const taken = await takeWorkspace(root);
    assert.equal(taken.held, false, "a workspace another process holds cannot be taken");
    assert.match(String(taken.by), new RegExp(String(port)), "and the refusal names the port that is held");
  } finally {
    try {
      process.kill(-(holder.pid as number), "SIGKILL");
    } catch {
      /* already gone */
    }
    releaseWorkspace(root);
    rmSync(root, { recursive: true, force: true });
  }
});

// RED. Recording that a hand was started rides a verb that is not legal in
// every state, so the registration is refused exactly where a hand was just
// spawned. Measured on this record's own M0: a hand was started, the record
// refused to count it, and the hand had to be closed again.
test("recording that a hand was started is accepted wherever the walk stands", () => {
  assert.equal(registrationExempt("agent"), true, "starting a hand is recordable from any state");
  assert.equal(registrationExempt("agent_done"), true, "and so is closing one");
  assert.equal(registrationExempt("command"), false, "and nothing else the verb carries is widened");
  assert.equal(registrationExempt("jobs"), false, "listing jobs stays gated");
});

// THE PREDICATE IS NOT THE GATE, and the gate is where the widening can go
// wrong. Asking only whether an exempt KEY is present lets a command carrying
// an empty one through in every state.
test("a call is exempt only when the whole call is a registration", () => {
  assert.equal(isRegistrationCall({ agent: "a walker", model: "m" }), true, "a real registration passes");
  assert.equal(isRegistrationCall({ agent_done: "job-1", ok: false }), true, "so does closing one");
  assert.equal(isRegistrationCall({ agent: "", command: "echo hi" }), false, "a command wearing an empty agent does not");
  assert.equal(isRegistrationCall({ agent: "a walker", command: "echo hi" }), false, "and neither does one wearing a real agent");
  assert.equal(isRegistrationCall({ agent: "a walker", jobs: true }), false, "listing the roster is not a registration");
  assert.equal(isRegistrationCall({ agent: "a walker", ack: true }), false, "acknowledging settled work is not either");
  assert.equal(isRegistrationCall({ agent: null }), false, "an exempt key with no name is not a registration");
  assert.equal(isRegistrationCall({ command: "echo hi" }), false, "and a plain command is untouched");
});

// THE ID IS NOT `op-bound-1`. That one is taken by the case above, and
// re-registering a running id is a silent no-op — so this case read the OTHER
// entry and failed on it.
//
// RED against the first build of the bound. Expiry closed the entry and the
// account then dropped it after its single ride, so the run's REAL outcome
// reached nobody. The wait's own table puts the work's outcome above the
// bound's wherever both exist — req-every-wait-declares-a-bound-and-expiry-acts.
test("work the bound closed still reports how it actually ended", async () => {
  const root = freshRoot();
  try {
    open({ id: "op-expiry-1", kind: "agent", command: "a hand nobody can ask about", root, bound_ms: 1 });
    await wait(20);
    sweepGoneOperations(true, root);
    const expired = workAccount(root).find((e) => e.job === "op-expiry-1");
    assert.equal(expired?.running, false, "a wait past its bound stops waiting");
    assert.match(String(expired?.outcome), /bound reached/, "and the outcome names the bound");
    // THE BASIS IS PART OF THE OUTCOME. A reader who cannot tell a measured
    // bound from a blanket default trusts the figure more than it has earned.
    assert.match(String(expired?.outcome), /measured|default/, "and says where the figure came from");
    // SPEND THE SINGLE RIDE. A finished entry rides one answer and is dropped,
    // so this is the state the real ending has to climb back out of.
    workAccount(root);
    assert.equal(
      workAccount(root).find((e) => e.job === "op-expiry-1"),
      undefined,
      "the expiry has been read",
    );
    settleOperation("op-expiry-1", true, root);
    const corrected = workAccount(root).find((e) => e.job === "op-expiry-1");
    assert.equal(corrected?.outcome, "passed", "the work's own ending replaces the bound's guess");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED against the first build of the bound. It closed every entry past its
// bound, including ones whose process the engine could see running — the exact
// fault the existence row measures at zero, four lines from the code that
// refuses it.
test("a process the engine can see running is never closed by its bound", async () => {
  const root = freshRoot();
  const child = longChild();
  try {
    open({ id: "op-bound-2", kind: "agent", command: "a hand that is plainly alive", root, pid: child.pid, bound_ms: 1 });
    await wait(20);
    const closed = sweepGoneOperations(true, root);
    assert.ok(!closed.includes("op-bound-2"), `existence beats the clock: ${JSON.stringify(closed)}`);
    const entry = workAccount(root).find((e) => e.job === "op-bound-2");
    assert.equal(entry?.running, true, "a process that answers `there` is still working");
  } finally {
    child.stop();
    rmSync(root, { recursive: true, force: true });
  }
});

// RED against the first build of the sweep. The table is per-process and holds
// every folder this server has served, and the sweep walked all of it — so a
// read of one folder closed another folder's work on its behalf.
test("one folder's sweep leaves another folder's work alone", async () => {
  const mine = freshRoot();
  const theirs = freshRoot();
  try {
    open({ id: "op-root-1", kind: "agent", command: "work belonging to another folder", root: theirs, bound_ms: 1 });
    await wait(20);
    const closed = sweepGoneOperations(true, mine);
    assert.ok(!closed.includes("op-root-1"), `a folder closes only its own work: ${JSON.stringify(closed)}`);
    // NOT THROUGH ITS OWN FOLDER'S ACCOUNT. Reading a folder sweeps it, so that
    // read would close the entry and prove nothing about the first sweep.
    assert.ok(sweepGoneOperations(true, theirs).includes("op-root-1"), "its own folder's sweep does close it");
  } finally {
    rmSync(mine, { recursive: true, force: true });
    rmSync(theirs, { recursive: true, force: true });
  }
});

// RED against the first build of the sweep. The loop walks the table in
// insertion order with no guard, so one entry that threw left every LATER entry
// reporting itself as running — the fault this record exists to remove, brought
// back by the code removing it.
test("one entry that cannot be asked never hides the entries after it", async () => {
  const root = freshRoot();
  try {
    // A HANDLE THAT REFUSES TO BE ASKED. Reading how a process ended is the one
    // thing the sweep does to every entry, and nothing promises it answers.
    const hostile = {
      get exitCode(): number {
        throw new Error("this handle cannot be asked");
      },
      signalCode: null,
      once: () => {},
    } as unknown as Parameters<typeof open>[0]["child"];
    open({ id: "op-hostile-1", kind: "agent", command: "work that cannot be asked", root, child: hostile });
    open({ id: "op-after-1", kind: "agent", command: "work registered after it", root, bound_ms: 1 });
    await wait(20);
    const closed = sweepGoneOperations(true, root);
    assert.ok(closed.includes("op-after-1"), `a later entry is still swept: ${JSON.stringify(closed)}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED against the first build of the bound. The fields existed and reached a
// reader only through an untyped spread, and the one case for them asserted on
// the JOB LISTING rather than on the account — through a cast, because the
// account's own type did not declare them.
//
// THE ACCOUNT IS WHAT A PULLING AGENT SEES. sty-the-wait-that-says-how-long-it
// -will-wait asks that the answer say how long the wait is bounded to, and the
// answer is the account, so that is where it has to be pinned.
test("the answer an agent reads says how long the wait is bounded to", () => {
  const root = freshRoot();
  try {
    open({ id: "op-declared-1", kind: "judgment", command: "true", root });
    const entry = workAccount(root).find((e) => e.job === "op-declared-1");
    assert.equal(typeof entry?.bound_ms, "number", "the account names how long the wait will wait");
    assert.ok(
      entry?.bound_basis === "measured" || entry?.bound_basis === "default",
      `and says where the figure came from: ${String(entry?.bound_basis)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
