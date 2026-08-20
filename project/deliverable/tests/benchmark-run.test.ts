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
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { benchmarkBind, leastRecentlyBenchmarked, rewindPointFor, standRewoundTree } from "../engine/benchmark.ts";
import { controlFilesPresent, resolvesInBoundTree } from "../engine/benchmark-guard.ts";
import { conditionsStampDirs, costPerState, reportProblems, UNATTRIBUTED } from "../engine/benchmark-report.ts";
import { git } from "../engine/gitlane.ts";
import { freshRoot, gitInit } from "./helpers.ts";

const SUBJECT = "i90-the-iteration-under-benchmark";
/** Numbered BELOW the subject, so it existed at the rewind point — which is
 *  the only thing that makes it a control rather than a newer file. */
const OLDER = "i89-a-neighbour-that-predates-the-rewind";
const CONTROL = "i91-a-neighbour-that-must-survive-the-rewind";

function write(root: string, rel: string, text: string): void {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text, "utf8");
}

/** A repository with a past, a rewind point, and a future beyond it.
 *
 *  The commit that names the subject started is what the rewind point is the
 *  parent of, so everything committed BEFORE it is the past the benchmark is
 *  allowed to see, and everything after is what must be absent. */
/** The three conditions no log holds. Nothing in the repo sets them, so a
 *  test that wants a run to BIND has to supply them — which is the point. */
const CONDITIONS_SET = { SE_HARNESS: "test-harness", SE_MODEL: "test-model", SE_EFFORT: "test-effort" };

function withConditions<T>(env: Record<string, string>, fn: () => T): T {
  const keys = ["SE_HARNESS", "SE_MODEL", "SE_EFFORT"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

function benchRepo(): { root: string; rewind: string; futureCommit: string } {
  const root = freshRoot();
  gitInit(root);
  write(root, `project/spec/iterations/${SUBJECT}/record.md`, `---\nid: ${SUBJECT}\nstatus: shipped\n---\n`);
  // THE PIN IS THE SCALE FACTOR and a report is refused without it, so a
  // fixture standing in for a real archived iteration carries one.
  write(root, `project/spec/iterations/${SUBJECT}/machines/seeded.json`, JSON.stringify({ change_size: "major" }));
  write(root, `project/spec/iterations/${OLDER}/record.md`, `---\nid: ${OLDER}\nstatus: shipped\n---\n`);
  write(root, `project/spec/trace/requirement/req-the-older-neighbour-left-a-trace.md`, `about ${OLDER}\n`);
  write(root, `project/spec/trace/requirement/req-known-before-the-rewind.md`, `about ${CONTROL} and the past\n`);
  write(root, "project/deliverable/engine/today.ts", "export const now = 1;\n");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "the past");
  const rewind = git(root, "rev-parse", "HEAD").stdout;

  git(root, "commit", "-q", "--allow-empty", "-m", `iteration ${SUBJECT}: started`);

  write(root, "project/spec/trace/requirement/req-the-answer-the-benchmark-must-not-see.md", "the future\n");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "the future");
  return { root, rewind, futureCommit: git(root, "rev-parse", "HEAD").stdout };
}

describe("a bound run cannot reach past its rewind point", { concurrency: true }, () => {
  test("the rewind point is the parent of the commit that named the iteration started", () => {
    const { root, rewind } = benchRepo();
    assert.equal(rewindPointFor(root, SUBJECT), rewind, "the parent of the started commit, exactly");
  });

  test("an iteration with no started commit resolves no rewind point at all", () => {
    // Silence here would cut a benchmark at a commit nobody chose.
    const { root } = benchRepo();
    assert.equal(rewindPointFor(root, "i92-never-started"), undefined);
  });

  test("standing the tree rewinds the spec and leaves the machine current", () => {
    const { root, rewind } = benchRepo();
    const into = join(root, ".bench-tree");
    const stood = standRewoundTree(root, SUBJECT, rewind, into);
    assert.ok(stood.files > 0, "a depth-1 fetch stands a working tree");
    assert.deepEqual(stood.rewound, ["project/spec"], "only the subject is rewound");
    assert.deepEqual(
      stood.current,
      ["project/deliverable", "project/guidance"],
      "the machine and the method stay current — a whole-tree rewind does not compile",
    );
    assert.ok(
      !existsSync(join(into, "project/spec/trace/requirement/req-the-answer-the-benchmark-must-not-see.md")),
      "the future is not in the tree",
    );
  });

  test("a commit newer than the rewind point does not resolve in the bound tree", () => {
    const { root, rewind, futureCommit } = benchRepo();
    const into = join(root, ".bench-tree");
    standRewoundTree(root, SUBJECT, rewind, into);
    assert.equal(resolvesInBoundTree(into, futureCommit), false, "the object is absent, so the request cannot be formed");
    assert.equal(resolvesInBoundTree(into, rewind), true, "and the rewind point itself still resolves");
  });

  test("the positive control: another iteration's files ARE present in the same fetched tree", () => {
    // An empty fetch and a correct rewind are indistinguishable without this.
    const { root, rewind } = benchRepo();
    const into = join(root, ".bench-tree");
    standRewoundTree(root, SUBJECT, rewind, into);
    assert.ok(controlFilesPresent(into, CONTROL) > 0, "the tree holds a different iteration's trace");
  });

  test("with no iteration named, a run takes the one benchmarked longest ago", () => {
    // Runs CYCLE rather than repeating the last one, and the reports folder is
    // the only scheduler state there is.
    const { root } = benchRepo();
    assert.notEqual(leastRecentlyBenchmarked(root), undefined, "an unnamed run still knows what to walk");
  });

  test("a run that cannot establish its rewind point refuses to bind at all", () => {
    const { root } = benchRepo();
    const r = benchmarkBind(root, { iteration: "i92-never-started" });
    assert.ok("refused" in r, "it refuses");
    assert.match(String((r as { refused: string }).refused), /rewind/i, "and the refusal names what could not be established");
  });

  test("a run that cannot say what it was taken under refuses AT BIND", () => {
    // Not at report time, after the whole walk. The conditions are knowable
    // now, and this module's own law is that the refusal happens once, at the
    // earliest point the cause is knowable. Catching it late binds, walks the
    // iteration, and throws the result away.
    const { root } = benchRepo();
    const r = withConditions({}, () => benchmarkBind(root, { iteration: SUBJECT }));
    assert.ok("refused" in r, "it refuses");
    assert.match(String((r as { refused: string }).refused), /model/, "and names what is unset");
    assert.match(String((r as { refused: string }).refused), /SE_MODEL/, "with the remedy");
  });

  test("a bound run names the iteration it re-walks and the commit it was cut at", () => {
    const { root, rewind } = benchRepo();
    const r = withConditions(CONDITIONS_SET, () => benchmarkBind(root, { iteration: SUBJECT }));
    assert.ok(!("refused" in r), `a sound request binds: ${JSON.stringify(r)}`);
    assert.equal((r as { iteration: string }).iteration, SUBJECT);
    assert.equal((r as { rewind: string }).rewind, rewind);
  });

  test("the control is run against a neighbour that PREDATES the rewind point", () => {
    // It used to pick the lowest-SORTING shipped iteration instead. That draws
    // a NEWER neighbour for the oldest subject, whose absence from the rewound
    // tree is correct — so the control failed for the right reason about the
    // wrong file, and refused the default run. i89 exists at i90's rewind
    // point; anything numbered above it does not.
    const { root } = benchRepo();
    const r = withConditions(CONDITIONS_SET, () => benchmarkBind(root, { iteration: SUBJECT }));
    assert.ok(!("refused" in r), `an older neighbour passes the control: ${JSON.stringify(r)}`);
    assert.equal((r as { controlled: boolean }).controlled, true, "and the run records that it had one");
  });
});

const CONDITIONS = ["iteration", "rewind", "change_size", "rigor_matrix_hash", "se_version", "harness", "model", "effort"];

function fullReport(): Record<string, unknown> {
  const r: Record<string, unknown> = {
    stop_at: "shipped",
    ended_at: "shipped",
    // A REPORT SAYS WHICH DIRECTORIES ITS CONDITIONS COVER. The matrix hash
    // alone is necessary and not sufficient, so the set is a field of its own
    // and the guard checks every pair has a hash beside it.
    stamp_covers: conditionsStampDirs()
      .map((d) => `${d}=abc123`)
      .join(" "),
  };
  for (const c of CONDITIONS) r[c] = "x";
  return r;
}

test("a stamp_covers line that names a directory with no hash is refused", () => {
  // The line used to be emitted and never looked at, so six directories with
  // an empty hash beside each read as a stamped set and asserted nothing.
  const r = fullReport();
  r.stamp_covers = "project/guidance= project/deliverable/engine=abc123";
  const problems = reportProblems(r);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /project\/guidance/, "and it names the directory that carries no hash");
});

test("a report with no stamp_covers at all is refused", () => {
  const r = fullReport();
  delete r.stamp_covers;
  assert.match(reportProblems(r).join(" "), /stamp_covers/);
});

// THE CONCEALMENT HAS A SPEC AND NO CASES YET, AND THAT IS DELIBERATE.
//
// `tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound` is authored in
// full — seven steps, written against CALL SITES rather than against any of the
// four disagreeing exclusion lists. What it describes is blocked on
// `wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-`:
// `search.ts` never reaches the containment seam, so a rule placed there holds
// for every verb except the one most likely to find a previous run's numbers.
//
// FOUR CASES USED TO SIT HERE AND ALL FOUR WERE WRONG TO BE HERE. Two asserted
// against stubs that returned `false` unconditionally — green from birth,
// proving nothing. Two were red and could not go green in this iteration, which
// left the battery permanently failing on work nobody had agreed to do.
//
// TEST-FIRST MEANS THE SPEC IS WRITTEN BEFORE THE BUILD, never that the cases
// are. The spec is the artifact and it stands; the cases land with the chunk.

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

  // EVERY RECORD BELOW IS THE SHAPE engine/calllog.ts REALLY WRITES. The first
  // version of these cases invented `where: string` and put the clause in
  // `outcome`; the product has neither, so the suite was green over a function
  // that returned {} on a real log of 13,619 records.
  test("cost per state reads the stamp the lane writes on every record", () => {
    const cost = costPerState([
      { tool: "se_pull", where: ["iterations/ix/draft-vision"], duration_ms: 10, ok: true, outcome: "result" },
      { tool: "se_file_read", where: ["iterations/ix/draft-vision"], duration_ms: 5, ok: true, outcome: "result" },
      { tool: "se_file_read", where: ["iterations/ix/draft-vision"], duration_ms: 5, ok: true, outcome: "result" },
      { tool: "se_pull", where: ["iterations/ix/gate-kickoff"], duration_ms: 10, ok: true, outcome: "result" },
      {
        tool: "se_file_search",
        where: ["iterations/ix/gate-kickoff"],
        duration_ms: 7,
        ok: false,
        outcome: "rejected",
        response: { clause: "SE-C-101" },
      },
    ]);
    assert.equal(cost["iterations/ix/draft-vision"]?.calls, 3);
    assert.equal(cost["iterations/ix/gate-kickoff"]?.calls, 2);
    assert.equal(cost["iterations/ix/draft-vision"]?.ms, 20, "durations sum within a state");
    assert.deepEqual(cost["iterations/ix/gate-kickoff"]?.refusals_by_clause, { "SE-C-101": 1 }, "the clause comes off the response");
    assert.equal(cost["iterations/ix/draft-vision"]?.entered, 1);
  });

  test("a clause cut out of a capped response is still counted", () => {
    // The log caps every non-se_run answer, so a rejection body can arrive as
    // a truncated string rather than an object.
    const cost = costPerState([
      { tool: "se_pull", where: ["s"], ok: true, outcome: "result" },
      { tool: "se_file_read", where: ["s"], ok: false, outcome: "rejected", response: '{"clause":"SE-C-102","expec' },
    ]);
    assert.deepEqual(cost.s?.refusals_by_clause, { "SE-C-102": 1 });
  });

  test("a crash is not counted as a typed refusal", () => {
    const cost = costPerState([
      { tool: "se_pull", where: ["s"], ok: true, outcome: "result" },
      { tool: "se_run", where: ["s"], ok: false, outcome: "errored", response: "boom" },
    ]);
    assert.deepEqual(cost.s?.refusals_by_clause, {}, "a crash never reached an expectation, so it names no clause");
    assert.equal(cost.s?.calls, 2, "and it still costs a call");
  });

  test("a refill is a form after a REFUSED FORM, never after any failed call", () => {
    const cost = costPerState([
      { tool: "se_pull", where: ["s"], ok: true, outcome: "result" },
      { tool: "se_file_read", where: ["s"], ok: false, outcome: "rejected", response: { clause: "SE-C-102" } },
      { tool: "se_pull", where: ["s"], args: { form: {} }, ok: true, outcome: "result" },
    ]);
    assert.equal(cost.s?.forms_filled, 1);
    assert.equal(cost.s?.forms_refilled, 0, "no form was ever refused, so nothing was refilled");
  });

  test("a form refused and sent again counts exactly one refill", () => {
    const cost = costPerState([
      { tool: "se_pull", where: ["s"], ok: true, outcome: "result" },
      { tool: "se_pull", where: ["s"], args: { form: {} }, ok: false, outcome: "rejected", response: { clause: "SE-C-112" } },
      { tool: "se_pull", where: ["s"], args: { form: {} }, ok: true, outcome: "result" },
    ]);
    assert.equal(cost.s?.forms_refilled, 1, "the machine sent the agent back once");
  });

  test("work before the first stamp is counted, never dropped", () => {
    // A total that silently omits work reads as a cheaper walk than happened.
    const cost = costPerState([
      { tool: "se_file_read", duration_ms: 9, ok: true, outcome: "result" },
      { tool: "se_pull", where: ["s"], duration_ms: 1, ok: true, outcome: "result" },
    ]);
    assert.equal(cost[UNATTRIBUTED]?.calls, 1, "it has a home of its own");
    assert.equal(cost[UNATTRIBUTED]?.ms, 9);
    assert.equal(cost.s?.calls, 1);
  });

  test("re-entering a state counts a second entry", () => {
    const cost = costPerState([
      { tool: "se_pull", where: ["a"], ok: true, outcome: "result" },
      { tool: "se_pull", where: ["b"], ok: true, outcome: "result" },
      { tool: "se_pull", where: ["a"], ok: true, outcome: "result" },
    ]);
    assert.equal(cost.a?.entered, 2, "states visited AND re-entered");
    assert.equal(cost.b?.entered, 1);
  });
});
