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
import { jobList } from "../engine/run.ts";

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
