// ONE CALL ACCOUNTS FOR EVERY PIECE OF WORK OUT OF SIGHT, authored test-first
// at i51's author-tests.
//
// BOTH CASES ARE RED, and neither is red by accident. The session keeps two job
// tables that cannot see each other — measured 2026-08-21 in
// exp-what-a-fresh-session-sees, `.se/jobs` held 35 entries and `.se/test-jobs`
// held 1 — and no entry anywhere carries a duration or what one would rest on.
//
// WHY jobList AND NOT THE LANE VERB. jobList is where the account is composed;
// se_run's {jobs: true} is a thin wrapper over it. Testing the wrapper would
// pass the moment the wrapper changed shape, without the account improving.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { jobList, noteStarted, workAccount } from "../engine/run.ts";

/** A root holding one shell job and one test job, both already finished. */
function rootWithBothKinds(): string {
  const root = mkdtempSync(join(tmpdir(), "se-account-"));
  const se = join(root, ".se");
  mkdirSync(join(se, "jobs"), { recursive: true });
  mkdirSync(join(se, "test-jobs"), { recursive: true });
  writeFileSync(
    join(se, "jobs", "job-shell-1.jsonl"),
    `${JSON.stringify({
      id: "job-shell-1",
      command: "node -e \"''\"",
      started: 1_787_308_711_348,
      exit: 0,
      running: false,
      pid: 1,
    })}\n`,
    "utf8",
  );
  writeFileSync(
    join(se, "test-jobs", "test-battery-1.jsonl"),
    `${JSON.stringify({
      id: "test-battery-1",
      started: 1_787_308_851_348,
      pace: " The last battery took 92s wall — expect the verdict on that scale.",
    })}\n`,
    "utf8",
  );
  return root;
}

// RED. jobList reads the shell table only, so a caller asking what is running
// is told about one kind of work and never learns the other kind exists.
test("one call lists every kind of work out of sight, not just the shell kind", () => {
  const root = rootWithBothKinds();
  try {
    const ids = jobList(root).map((j) => j.job);
    assert.ok(ids.includes("job-shell-1"), `the shell job is listed: ${JSON.stringify(ids)}`);
    assert.ok(
      ids.includes("test-battery-1"),
      `a test run is a piece of work out of sight and is missing from the account: ${JSON.stringify(ids)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// RED, and it is the half that keeps the figure honest. A duration with no
// stated basis is believed more than it deserves, which is why
// raid-dec-the-duration-and-its-basis-are-one-return-value makes them one value.
test("every entry states how much longer it needs and what that figure rests on", () => {
  const root = rootWithBothKinds();
  try {
    for (const entry of jobList(root)) {
      const seen = entry as unknown as Record<string, unknown>;
      assert.ok("basis" in seen, `${entry.job} carries no basis, so a reader cannot discount its figure: ${JSON.stringify(seen)}`);
      if (seen.remaining_ms !== undefined) {
        assert.equal(typeof seen.basis, "string", `${entry.job} gives a time remaining with no basis beside it`);
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// A caller that missed the moment still learns what happened. A test run's
// outcome is a verdict rather than a stream, so an entry that carried only
// `running: false` told them a run ended and never told them how.
test("a settled operation keeps what happened, for a caller that missed it", () => {
  const root = mkdtempSync(join(tmpdir(), "se-settled-"));
  try {
    mkdirSync(join(root, ".se", "test-jobs"), { recursive: true });
    writeFileSync(
      join(root, ".se", "test-jobs", "test-settled-1.jsonl"),
      `${JSON.stringify({
        id: "test-settled-1",
        started: 1_787_308_851_348,
        ended: 1_787_308_951_348,
        pace: " measured",
        verdict: { ok: false, question: "did the edit break the trace", tests: { total: 1722, pass: 1719, fail: 3 } },
      })}\n`,
      "utf8",
    );
    const entry = jobList(root).find((j) => j.job === "test-settled-1");
    assert.ok(entry !== undefined, "the settled run is still listed");
    assert.equal(entry.running, false, "and it is not running");
    assert.equal(
      entry.outcome,
      "red — 1719 of 1722 passed, 3 failed",
      `the outcome says what happened rather than only that it stopped: ${JSON.stringify(entry)}`,
    );
    assert.equal(entry.duration_ms, 100_000, "and the duration is how long it took, not how long ago it started");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE RIDER. An empty account is an empty LIST, never an absent field: absent
// cannot be told apart from a build that never emitted one, which is the first
// of the two findings the re-scoring pass raised against this design.
test("an account with nothing in it is an empty list, not an absent one", () => {
  const root = mkdtempSync(join(tmpdir(), "se-empty-"));
  try {
    const account = workAccount(root);
    assert.ok(Array.isArray(account), "the account is always a list");
    assert.equal(account.length, 0, `nothing is running in a fresh root: ${JSON.stringify(account)}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// History is not news. A run that ended before this session looked answers to
// se_run {jobs: true}; it does not ride on every answer for ever.
test("work that ended before this session looked does not ride", () => {
  const root = rootWithBothKinds();
  try {
    assert.ok(
      jobList(root).some((j) => j.job === "job-shell-1"),
      "the finished shell job is still in the table",
    );
    assert.equal(
      workAccount(root).some((j) => j.job === "job-shell-1"),
      false,
      "but it is history rather than something to tell the caller again",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE FIVE BELOW CLOSE THE VERIFICATION FINDINGS of i51's fresh-eyes pass. Each
// one failed before the fix beside it, and each names the demand it answers.

/** A root holding one test run still going, with progress on disk that belongs
 *  to THIS run — the header's `start` is what says so (see bin/selftest.ts). */
function rootWithLiveRun(id: string, started: number, headerStart = started): string {
  const root = mkdtempSync(join(tmpdir(), "se-live-"));
  const se = join(root, ".se");
  mkdirSync(join(se, "test-jobs"), { recursive: true });
  writeFileSync(join(se, "test-jobs", `${id}.jsonl`), `${JSON.stringify({ id, started, total: 10, pace: " measured" })}\n`, "utf8");
  writeFileSync(
    join(se, "test-progress.jsonl"),
    `${[
      JSON.stringify({ start: new Date(headerStart).toISOString(), files_total: 10 }),
      JSON.stringify({ file: "a.test.ts", t: 1000 }),
      JSON.stringify({ file: "b.test.ts", t: 2000 }),
    ].join("\n")}\n`,
    "utf8",
  );
  return root;
}

/** A root holding one test run that already settled, outcome and all. */
function rootWithSettledRun(id: string): string {
  const root = mkdtempSync(join(tmpdir(), "se-quick-"));
  mkdirSync(join(root, ".se", "test-jobs"), { recursive: true });
  writeFileSync(
    join(root, ".se", "test-jobs", `${id}.jsonl`),
    `${JSON.stringify({
      id,
      started: 1_787_308_851_348,
      ended: 1_787_308_861_348,
      pace: " measured",
      verdict: { ok: true, question: "did the edit break the lane", tests: { total: 12, pass: 12, fail: 0 } },
    })}\n`,
    "utf8",
  );
  return root;
}

// THE LOAD-BEARING CASE, and it never exercised a figure. Both entries in the
// old fixture were finished or had no total, so the only live assertion was
// that a `basis` key existed — which the spread satisfies unconditionally.
test("a running entry states how much longer it needs, projected from its own count", () => {
  const root = rootWithLiveRun("test-live-1", Date.now());
  try {
    const entry = jobList(root).find((j) => j.job === "test-live-1");
    assert.ok(entry !== undefined, "the live run is listed at all");
    // 2 of 10 finished in 2000ms projects 10000ms for all ten, so 8000 remain.
    assert.equal(entry.remaining_ms, 8000, `the figure is projected from the work's own count: ${JSON.stringify(entry)}`);
    assert.match(entry.basis, /2 of 10 finished on this run/, `and the basis names what it rests on: ${entry.basis}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// req-a-time-remaining-names-its-basis: "The entry says which measurement is not
// advancing rather than repeating a stale number in silence."
//
// MEASURED AGAINST THE RUN'S OWN CLOCK. This run started 60s ago and its last
// file finished 2s in, so nothing has finished for 58s. A first version counted
// READS of this table instead, which made a healthy run read as stalled the
// moment anything looked at it twice.
test("a figure that has stopped moving says so instead of repeating in silence", () => {
  const root = rootWithLiveRun("test-stall-1", Date.now() - 60_000);
  try {
    const entry = jobList(root).find((j) => j.job === "test-stall-1");
    assert.ok(entry !== undefined, "the run is still listed");
    assert.match(entry.basis, /nothing has finished for \d+s/, `the basis names the stall: ${entry.basis}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ONE ANSWER READS THIS TABLE TWICE. se_run {jobs: true} composes `jobs` from
// jobList, and the account decorator then calls workAccount, which calls
// jobList again — milliseconds apart, with nothing appended in between. A stall
// detector with a memory of earlier reads made those two passes contradict each
// other inside a single JSON answer about the same job.
test("two looks at the same live run agree with each other", () => {
  const root = rootWithLiveRun("test-agree-1", Date.now());
  try {
    const first = jobList(root).find((j) => j.job === "test-agree-1");
    const second = jobList(root).find((j) => j.job === "test-agree-1");
    assert.ok(first !== undefined && second !== undefined, "the run is listed on both looks");
    assert.equal(first.basis, second.basis, `two reads of one table must not contradict each other: ${first.basis} vs ${second.basis}`);
    assert.match(second.basis, /finished on this run/, `and neither calls healthy work a stall: ${second.basis}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// EVERY TEST OPERATION WRITES TO THE SAME PROGRESS PATH, so a file left by the
// previous run projects a figure from work that is not this work — while the
// basis claims it was measured on this one.
test("progress left by an earlier run is not projected as this run's", () => {
  const started = Date.now();
  const root = rootWithLiveRun("test-stale-1", started, started - 3_600_000);
  try {
    const entry = jobList(root).find((j) => j.job === "test-stale-1");
    assert.ok(entry !== undefined, "the run is still listed");
    assert.equal(entry.remaining_ms, undefined, `no figure is given from another run's lines: ${JSON.stringify(entry)}`);
    assert.match(entry.basis, /belongs to an earlier run/, `and it says why: ${entry.basis}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// req-one-call-reports-every-piece-of-work-out-of-sight: "A caller that missed
// the moment still learns the outcome, which is what makes one call enough." A
// test operation is rebuilt from its record on every read and never enters the
// in-memory table, so a run that started AND settled between two lane calls was
// dropped before any caller ever saw it.
test("a run this session started reports its outcome even if it settled unseen", () => {
  const root = rootWithSettledRun("test-quick-1");
  try {
    noteStarted("test-quick-1", root);
    const entry = workAccount(root).find((j) => j.job === "test-quick-1");
    assert.ok(entry !== undefined, "the run this session started reaches the caller");
    assert.equal(entry.standing, "finished", `and its outcome has not been handed over before: ${JSON.stringify(entry)}`);
    assert.equal(entry.outcome, "green — 12 of 12 passed, 0 failed", "with what happened, not only that it stopped");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// dsp-the-work-account.md: "AN ENTRY NEVER LEAVES THE TABLE INSIDE ONE SESSION.
// The account is the whole list, not the tail of it." The code used to drop a
// read entry, which left a reader unable to tell finished from read — it just
// stopped appearing.
test("an entry never leaves the table, and a second look marks it read", () => {
  const root = rootWithSettledRun("test-twice-1");
  try {
    noteStarted("test-twice-1", root);
    const first = workAccount(root).find((j) => j.job === "test-twice-1");
    assert.equal(first?.standing, "finished", "the first look hands the outcome over");
    const second = workAccount(root).find((j) => j.job === "test-twice-1");
    assert.ok(second !== undefined, "the entry is still in the table on the second look");
    assert.equal(second.standing, "read", `and it says the outcome has already been handed over: ${JSON.stringify(second)}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
