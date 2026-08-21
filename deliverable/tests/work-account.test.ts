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
import { jobList, workAccount } from "../engine/run.ts";

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
