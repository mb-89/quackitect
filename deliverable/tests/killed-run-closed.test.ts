// A KILLED TEST RUN IS CLOSED AT STARTUP, so the stop hook stops reporting a
// run that no longer exists.
//
// see dsp-the-work-account.md#a-killed-run-is-closed-at-startup
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { reapAbandonedTestJobs } from "../engine/run.ts";

/** A root holding one test-job record, written the way the engine writes it. */
function rootWith(lines: Record<string, unknown>[], id = "test-abc-1"): string {
  const root = mkdtempSync(join(tmpdir(), "se-reap-tests-"));
  const dir = join(root, ".se", "test-jobs");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}.jsonl`), lines.map((l) => `${JSON.stringify(l)}\n`).join(""), "utf8");
  return root;
}

function lastLine(root: string, id = "test-abc-1"): Record<string, unknown> {
  const raw = readFileSync(join(root, ".se", "test-jobs", `${id}.jsonl`), "utf8")
    .trim()
    .split("\n");
  return JSON.parse(raw[raw.length - 1]) as Record<string, unknown>;
}

describe("a killed test run is closed at startup", () => {
  test("a record with no end gets one, and says it was reaped", () => {
    const root = rootWith([{ id: "test-abc-1", started: 1_700_000_000_000, pace: "battery" }]);

    const reaped = reapAbandonedTestJobs(root);

    assert.deepEqual(reaped, ["test-abc-1"]);
    const last = lastLine(root);
    assert.equal(typeof last.ended, "number", "the wait is over and the record says so");
    assert.equal(last.reaped, true, "and says why it ended");
  });

  test("a run that closed itself is left alone", () => {
    const root = rootWith([
      { id: "test-abc-1", started: 1_700_000_000_000, pace: "battery" },
      { id: "test-abc-1", started: 1_700_000_000_000, ended: 1_700_000_060_000, pace: "battery" },
    ]);

    assert.deepEqual(reapAbandonedTestJobs(root), [], "nothing was open");
    assert.equal(lastLine(root).ended, 1_700_000_060_000, "and its own end is untouched");
  });

  test("no verdict is invented, because the run was killed rather than finished", () => {
    const root = rootWith([{ id: "test-abc-1", started: 1_700_000_000_000, pace: "battery" }]);

    reapAbandonedTestJobs(root);

    assert.equal(lastLine(root).verdict, undefined, "what it would have found is unknown");
  });

  test("an unreadable record is left exactly as it is", () => {
    const root = mkdtempSync(join(tmpdir(), "se-reap-tests-"));
    const dir = join(root, ".se", "test-jobs");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "test-broken-1.jsonl"), "this was never json\n", "utf8");

    assert.deepEqual(reapAbandonedTestJobs(root), [], "bookkeeping never becomes the reason a startup fails");
    assert.equal(readFileSync(join(dir, "test-broken-1.jsonl"), "utf8"), "this was never json\n");
  });

  test("a root that never ran a test answers with nothing", () => {
    const root = mkdtempSync(join(tmpdir(), "se-reap-tests-"));

    assert.deepEqual(reapAbandonedTestJobs(root), []);
  });
});
