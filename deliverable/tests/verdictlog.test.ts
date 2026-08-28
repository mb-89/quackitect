// THE FIRE-AND-FORGET VERDICT: a test job's verdict must land in the call log
// by itself. An unfetched failure must not be invisible to the retro.
//
// The second test guards the other half of the same seam: a call that can
// never run must refuse AT THE CALL, not become a job that fails quietly.
//
// THE CALLER NO LONGER CHOOSES THE SCOPE. These cases
// passed `files: ["tiny"]` to make a run scoped, and se_test has no scope
// argument any more: the agent says what it wants to know, and `decideScope`
// reads what CHANGED to pick the battery, a named set, or nothing.
//
// SO THE OLD PREMISE IS GONE AND THE DEMAND IS NOT. What these cases exist to
// hold is that a verdict records itself and that a run with no question is
// refused before it becomes a job. Both are asked here without the caller
// naming a scope.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { test } from "node:test";
import { testRecord } from "../engine/discipline.ts";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

/** A COMMITTED TREE, so `decideScope` sees nothing changed. That is the one
 *  decision a fixture can produce without staging a change and a test file to
 *  match it. */
function committed(root: string): void {
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "fixture"], { cwd: root, encoding: "utf8" });
}

test("a run's verdict logs itself, whatever the engine decided to run", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);

  const started = await call(server, "se_test", {
    force: true,
    question: "does a handed-off run log its own verdict?",
  });

  // THE ENGINE SAYS WHAT IT DID. `decided` is the whole point of moving the
  // choice: the caller can always state what ran and why, without having
  // chosen it.
  const body = started.body as Record<string, unknown>;
  assert.notEqual(body.job, undefined, `every run carries its job handle: ${JSON.stringify(body)}`);

  // force IS A FLAKE HUNT, which is the whole suite by definition, so it hands
  // back a handle rather than blocking.
  assert.equal(body.handed_off, true, `the battery hands off: ${JSON.stringify(body)}`);

  // THE HANDLE READS BACK OFF THE ACCOUNT, not off a status verb. There is no
  // poll: a run reports itself on the `work` block of every lane answer.
  const job = String(body.job);
  const onAccount = (r: Record<string, unknown>): boolean => ((r.work ?? []) as { job?: string }[]).some((e) => e.job === job);
  const recovered = await call(server, "se_pull", {});
  assert.ok(onAccount(recovered.body), "the handle reads back off the work account");

  // A SECOND SERVER SEES THE SAME HANDLE. The verdict lives on disk rather
  // than in one process's memory, which is what makes it survivable.
  const secondServer = await bootedServer(root);
  const elsewhere = await call(secondServer, "se_pull", {});
  assert.ok(onAccount(elsewhere.body), "and reads back from a different process");
});

// req-test-run-carries-its-question: the engine says which tests ran, and only
// the question says why. A run that states none is refused rather than
// recorded as an unexplained green.
//
// THE BATTERY IS EXEMPT AND ALWAYS WAS — its question is fixed, so there is
// nothing for a caller to add. The demand binds every narrower run.
//
// A FIXTURE REACHES ONE ONLY BY SEEDING THE BATTERY'S MEMORY. `decideScope`
// answers `battery` while no battery has ever run there — "no baseline to scope
// against" — so a fresh root can never produce a narrower run however little it
// changed. Recording one green battery, then changing nothing, is the smallest
// honest way to the branch that asks for the question.
test("a run narrower than the battery refuses without a question, before any handoff", async () => {
  const root = freshRoot();
  committed(root);
  // ONE GREEN BATTERY ON RECORD, and nothing changed since.
  testRecord(join(root, ".se"), root, true);
  const server = await bootedServer(root);

  const bare = await call(server, "se_test", {});
  assert.equal(bare.body.handed_off, undefined, `no handle for a call that cannot run: ${JSON.stringify(bare.body)}`);
  assert.equal(bare.body.clause, "SE-C-136", JSON.stringify(bare.body));

  // Whitespace is not a question.
  const blank = await call(server, "se_test", { question: "   " });
  assert.equal(blank.body.clause, "SE-C-136", JSON.stringify(blank.body));

  // AND THE REFUSAL'S REMEDY IS EXECUTABLE. It named a `files` argument that
  // no longer exists, which is a refusal handing back another refusal.
  const remedy = (bare.body as { remedy?: { args?: Record<string, unknown> } }).remedy;
  assert.equal(remedy?.args?.files, undefined, `the remedy names no scope argument: ${JSON.stringify(remedy)}`);
  assert.notEqual(remedy?.args?.question, undefined, "and it does name the question");
});

// THE SCOPE ARGUMENT IS GONE, and a caller reaching for it is told so rather
// than quietly ignored. An argument silently dropped is how a caller keeps
// believing it chose the scope.
test("naming a scope is refused, because choosing it was never the caller's job", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);

  const scoped = await call(server, "se_test", { files: ["tiny"], question: "does the old shape still work?" });
  assert.equal(scoped.body.kind, "rejected", `a scope argument refuses: ${JSON.stringify(scoped.body)}`);
  assert.match(JSON.stringify(scoped.body), /files/, "and the refusal names the argument that does not exist");
});

// THE RED VERDICT USED TO BE A TAIL SLICE, and a tail drops the beginning.
//
// The runner prints a stack under every failure, so the six thousand
// characters the verdict kept held about three of them. A run with fifty red
// reported three, and the cap landed mid-list so even the count was wrong.
// The workaround was a hand-written script reading the job file off disk.
//
// WHAT A READER NEEDS FIRST is which files are red and how many in each, and
// that is precisely what fell off the front.
test("a red battery names every failing case, grouped by its file, most first", async () => {
  const { failureSummary } = await import("../engine/testreporters.ts");
  const M = String.fromCharCode(0x2716);
  const runner = [
    "test at tests/alpha.test.ts:10:1",
    `${M} one thing broke (12.5ms)`,
    "  AssertionError: nope",
    "test at tests/alpha.test.ts:40:1",
    `${M} another thing broke (3ms)`,
    "test at tests/beta.test.ts:7:1",
    `${M} beta broke (1ms)`,
    // The runner repeats the names in a trailing block. A repeat is not a
    // second failure.
    `${M} failing tests:`,
    `${M} one thing broke (12.5ms)`,
    `${M} beta broke (1ms)`,
  ].join("\n");

  const said = failureSummary(runner);
  assert.match(said, /3 failing case\(s\) across 2 file\(s\)/, "the repeats are not counted twice");
  assert.match(said, /tests\/alpha\.test\.ts {2}\(2\)/, "the file with more red comes first, with its count");
  assert.ok(said.indexOf("alpha") < said.indexOf("beta"), "most first");
  for (const name of ["one thing broke", "another thing broke", "beta broke"]) {
    assert.ok(said.includes(name), `every case is named, and ${name} is missing`);
  }
  assert.ok(!said.includes("failing tests:"), "the runner's own header is not a case");
});
