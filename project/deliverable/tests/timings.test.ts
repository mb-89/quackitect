// req-scoped-run-records-its-timings: a run that measures nothing cannot
// answer a question about cost, and the scoped path measured nothing.
//
// The battery attached the timing reporter and the scoped path did not, so a
// file could only be timed inside a run where twenty files contend and no
// duration is its own.
//
// WHY THESE CASES DO NOT DRIVE se_test END TO END. Every test that spawns a
// scoped run from inside a test file gets this from node:
//
//   run() is being called recursively within a test file. skipping running files
//
// so the inner run executes ZERO cases, always. A case asserting on its
// output would be asserting on an empty run — which is note-ae6265b74821, and
// it is why the wiring is checked at the seam instead.
import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { TIMINGS_DIR_ENV, testConcurrency, testReporterArgs, timedSince, timingReport } from "../engine/testreporters.ts";

test("the scoped run's reporters carry the timing reporter, and it exists", () => {
  const args = testReporterArgs("tap");
  assert.ok(args.includes("--test-reporter=tap"), `the parsed output is TAP: ${args.join(" ")}`);

  const reporter = args.find((a) => a.startsWith("--test-reporter=file:"));
  assert.ok(reporter !== undefined, `a timing reporter is attached: ${args.join(" ")}`);

  const path = fileURLToPath(reporter.slice("--test-reporter=".length));
  assert.ok(existsSync(path), `the reporter it names is on disk: ${path}`);
});

// The battery and the scoped path built their reporter lists separately, and
// only one of them carried the timing reporter. One builder is what stops
// that happening again, so the two lists differ ONLY in the human reporter.
test("the battery and the scoped run differ only in which output a person reads", () => {
  const battery = testReporterArgs("spec");
  const scoped = testReporterArgs("tap");
  assert.equal(battery.length, scoped.length);
  assert.deepEqual(battery.slice(1), scoped.slice(1), "everything after the human reporter is shared");
});

// THE REPORTER IS FOUND FROM THE ENGINE, never from the tree under test. A
// fixture root holds no engine, and resolving there is what the first attempt
// at this fix got wrong.
test("the reporter is found beside the engine, not under the tree being tested", () => {
  const reporter = testReporterArgs("tap").find((a) => a.startsWith("--test-reporter=file:"));
  assert.ok(reporter !== undefined);
  const path = fileURLToPath(reporter.slice("--test-reporter=".length)).split("\\").join("/");
  assert.ok(path.endsWith("/engine/bin/test-timings.mjs"), `it names the engine's own reporter: ${path}`);
});

test("a run's timing count is what it wrote, not what was already there", () => {
  const se = mkdtempSync(join(tmpdir(), "se-timings-"));
  const before = Date.now();
  const older = new Date(before - 60_000).toISOString();
  const newer = new Date(before + 1_000).toISOString();
  writeFileSync(
    join(se, "test-timings.jsonl"),
    `${[
      JSON.stringify({ run: older, file: "a", name: "an earlier run", ms: 1, ok: true }),
      JSON.stringify({ run: newer, file: "a", name: "this run", ms: 2, ok: true }),
      JSON.stringify({ run: newer, file: "a", name: "this run too", ms: 3, ok: true }),
    ].join("\n")}\n`,
    "utf8",
  );
  assert.equal(timedSince(se, before), 2, "only the rows this run stamped are counted");
});

test("a missing timings file counts as nothing timed rather than throwing", () => {
  const se = mkdtempSync(join(tmpdir(), "se-timings-"));
  assert.equal(timedSince(se, Date.now()), 0);
});

// A bookkeeping write that may never fail the suite must still be able to say
// it failed. Every write in the reporter sits inside a try that swallows its
// error, so a run whose records went nowhere read exactly like one whose
// records landed — which is how two green batteries recorded nothing on
// 2026-08-15 without anybody noticing.
test("a run that timed less than it ran says so in its own verdict", () => {
  assert.deepEqual(timingReport(4, 4), { timed: 4 }, "a complete run reports the count and nothing else");

  const gap = timingReport(0, 4) as { timed: number; timing_gap: string };
  assert.equal(gap.timed, 0);
  assert.match(gap.timing_gap, /4 of 4/, `the gap names both numbers: ${gap.timing_gap}`);
});

test("the reporter is told where to write, so it never has to guess a root", () => {
  assert.equal(TIMINGS_DIR_ENV, "SE_TIMINGS_DIR");
});

// The engine is one process on the same cores the workers take. Its own share
// is what keeps the lane answering while a run is in flight, and the number
// is read from the machine rather than written into the design.
test("the fan-out leaves the engine a core, and never asks for fewer than one", () => {
  assert.equal(testConcurrency(16), 15);
  assert.equal(testConcurrency(2), 1);
  assert.equal(testConcurrency(1), 1, "a single-core machine still runs");
  assert.equal(testConcurrency(0), 1, "an unknown core count never yields zero workers");
});
