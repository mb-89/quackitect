// THE BENCHMARK RUN, checked against the three test-method specs authored at
// author-tests. Every case name states the requirement's claim.
//
//   tsp-a-bound-run-cannot-reach-past-its-rewind-point
//   tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound
//   tsp-a-benchmark-report-carries-its-conditions
//
// These fail against the stubs and that is the point: a check green from birth
// proves nothing.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { benchmarkBind, leastRecentlyBenchmarked, rewindPointFor, standRewoundTree } from "../engine/benchmark.ts";
import { concealedFromLane, concealmentCallSites, controlFilesPresent, resolvesInBoundTree } from "../engine/benchmark-guard.ts";
import { conditionsStampDirs, costPerState, reportProblems } from "../engine/benchmark-report.ts";
import { freshRoot, gitInit } from "./helpers.ts";

const CONDITIONS = ["iteration", "rewind", "change_size", "rigor_matrix_hash", "se_version", "harness", "model", "effort"];

function fullReport(): Record<string, unknown> {
  const r: Record<string, unknown> = { stop_at: "shipped", ended_at: "shipped" };
  for (const c of CONDITIONS) r[c] = "x";
  return r;
}

describe("a bound run cannot reach past its rewind point", { concurrency: true }, () => {
  test("the rewind point is the parent of the commit that named the iteration started", () => {
    const root = freshRoot();
    gitInit(root);
    assert.notEqual(rewindPointFor(root, "i33"), undefined, "an archived iteration resolves a rewind point");
  });

  test("a commit newer than the rewind point does not resolve in the bound tree", () => {
    assert.equal(resolvesInBoundTree("/tree", "a-commit-after-the-rewind"), false);
  });

  test("the positive control: another iteration's files ARE present in the same fetched tree", () => {
    // An empty fetch and a correct rewind are indistinguishable without this.
    assert.ok(controlFilesPresent("/tree", "i34") > 0, "the tree holds a different iteration's trace");
  });

  test("standing the tree rewinds the spec and leaves the machine current", () => {
    const root = freshRoot();
    gitInit(root);
    const stood = standRewoundTree(root, "i33", "deadbeef", "/tree");
    assert.ok(stood.files > 0, "a depth-1 fetch stands a working tree");
    assert.deepEqual(stood.rewound, ["project/spec"], "only the subject is rewound");
    assert.deepEqual(
      stood.current,
      ["project/deliverable", "project/guidance"],
      "the machine and the method stay current — a whole-tree rewind does not compile",
    );
  });

  test("a run that cannot establish its rewind point refuses to bind at all", () => {
    const root = freshRoot();
    gitInit(root);
    const r = benchmarkBind(root, { iteration: "i-does-not-exist" });
    assert.ok("refused" in r, "it refuses");
    assert.match(String((r as { refused: string }).refused), /rewind/i, "and the refusal names what could not be established");
  });

  test("with no iteration named, a run takes the one benchmarked longest ago", () => {
    // Runs CYCLE rather than repeating the last one, and the reports folder is
    // the only scheduler state there is.
    const root = freshRoot();
    gitInit(root);
    assert.notEqual(leastRecentlyBenchmarked(root), undefined, "an unnamed run still knows what to walk");
  });

  test("a bound run names the iteration it re-walks and the commit it was cut at", () => {
    const root = freshRoot();
    gitInit(root);
    const r = benchmarkBind(root, { iteration: "i33" });
    assert.ok(!("refused" in r), "a sound request binds");
  });
});

describe("the benchmark reports are concealed while a run is bound", { concurrency: true }, () => {
  test("a reports path is invisible to the lane while a run is bound", () => {
    assert.equal(concealedFromLane("project/spec/benchmarks/bench-i33.md", true), true);
  });

  test("the same path is visible with no run bound", () => {
    assert.equal(concealedFromLane("project/spec/benchmarks/bench-i33.md", false), false);
  });

  test("a path that merely resembles a reports path is never concealed", () => {
    // The rule is a rule, not a substring: this must stay visible either way.
    assert.equal(concealedFromLane("project/spec/benchmarksomething/notes.md", true), false);
  });

  test("the mask covers every call site that was measured, and the count is asserted", () => {
    // Four sites across three files. A verb added later fails here rather than
    // escaping the rule, which is why the count is the assertion.
    assert.deepEqual(concealmentCallSites().sort(), [
      "engine/files.ts:fileRead",
      "engine/paths.ts:resolveInRoot",
      "engine/search.ts:fileGlob",
      "engine/search.ts:fileSearch",
    ]);
  });
});

describe("a benchmark report carries the conditions of its run", { concurrency: true }, () => {
  test("a report carrying every condition records", () => {
    assert.deepEqual(reportProblems(fullReport()), []);
  });

  for (const missing of CONDITIONS) {
    test(`a report omitting ${missing} is refused, and the refusal names it`, () => {
      const r = fullReport();
      delete r[missing];
      const problems = reportProblems(r);
      assert.equal(problems.length, 1, "exactly one problem — the missing field");
      assert.match(problems[0], new RegExp(missing), "and it names the field");
    });
  }

  test("the stop point given and the state ended in are both recorded, even when equal", () => {
    const r = fullReport();
    delete r.ended_at;
    assert.ok(reportProblems(r).length > 0, "an omitted ended_at is not the same as reaching the end");
  });

  test("the conditions stamp names every directory it covers, not the matrix alone", () => {
    // The matrix hash covers rigor_matrix/rows and nothing else, so guidance,
    // forms, items, methods and the engine all move walk cost without moving it.
    assert.deepEqual(conditionsStampDirs().sort(), [
      "project/deliverable/engine",
      "project/deliverable/machines/forms",
      "project/deliverable/machines/items",
      "project/deliverable/machines/methods",
      "project/deliverable/machines/rigor_matrix/rows",
      "project/guidance",
    ]);
  });

  test("cost per state attributes every call between two pulls to the state the earlier one named", () => {
    const cost = costPerState([
      { tool: "se_pull", where: "iterations/ix/draft-vision", duration_ms: 10, ok: true },
      { tool: "se_file_read", duration_ms: 5, ok: true },
      { tool: "se_file_read", duration_ms: 5, ok: true },
      { tool: "se_pull", where: "iterations/ix/gate-kickoff", duration_ms: 10, ok: true },
      { tool: "se_file_search", duration_ms: 7, ok: false, outcome: "SE-C-101" },
    ]);
    assert.equal(cost["iterations/ix/draft-vision"]?.calls, 3, "the pull and the two reads after it");
    assert.equal(cost["iterations/ix/gate-kickoff"]?.calls, 2, "the next pull and the call after it");
    assert.equal(cost["iterations/ix/draft-vision"]?.ms, 20, "durations sum within a state");
    assert.deepEqual(cost["iterations/ix/gate-kickoff"]?.refusals_by_clause, { "SE-C-101": 1 }, "refusals are counted by clause");
  });
});
