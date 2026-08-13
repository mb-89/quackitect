// THE FIRE-AND-FORGET VERDICT: a test job's verdict must land in the call log
// by itself. An unfetched failure must not be invisible to the retro.
//
// The second test guards the other half of the same seam: a call that can
// never run must refuse AT THE CALL, not become a job that fails quietly.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { bootedServer, call, freshRoot, waitForTestJob } from "./helpers.ts";

test("a handed-off scoped run logs its own verdict without being fetched", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  // A fixture root carries no tests directory — plant one green case.
  mkdirSync(join(root, "project", "deliverable", "tests"), { recursive: true });
  writeFileSync(
    join(root, "project", "deliverable", "tests", "tiny.test.ts"),
    'import { test } from "node:test";\nimport { strict as assert } from "node:assert";\ntest("one", () => { assert.equal(1, 1); });\n',
    "utf8",
  );
  const started = await call(server, "se_test", {
    files: ["tiny"],
    force: true,
    question: "does a handed-off run log its own verdict?",
  });
  assert.equal(started.body.handed_off, true, JSON.stringify(started.body));
  const job = String(started.body.job);
  const verdict = await waitForTestJob(server, job);
  assert.equal(verdict.running, false, `the run finished: ${JSON.stringify(verdict)}`);
  const secondServer = await bootedServer(root);
  const recovered = await call(secondServer, "se_test", { job });
  assert.equal(recovered.body.job, verdict.job);
  assert.equal(recovered.body.running, false);
  assert.equal(recovered.body.ok, verdict.ok);
  assert.deepEqual(recovered.body.tests, verdict.tests);
  const query = await call(server, "se_log_query", { filter: { tool: "se_test_verdict" } });
  const records = query.body.records as { args: { job: string }; ok: boolean }[];
  assert.equal(records.length, 1, `the verdict logged itself: total ${String(query.body.total)}`);
  assert.equal(records[0].args.job, job);
  assert.equal(records[0].ok, true, "tiny.test.ts is green, so the verdict is too");
});

// req-test-run-carries-its-question: the scope says which tests ran, and only
// the question says why. A run that states none is refused rather than
// recorded as an unexplained green.
test("a scoped run with no question refuses at the call, before any handoff", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  mkdirSync(join(root, "project", "deliverable", "tests"), { recursive: true });
  writeFileSync(
    join(root, "project", "deliverable", "tests", "tiny.test.ts"),
    'import { test } from "node:test";\nimport { strict as assert } from "node:assert";\ntest("one", () => { assert.equal(1, 1); });\n',
    "utf8",
  );
  const bare = await call(server, "se_test", { files: ["tiny"], force: true });
  assert.equal(bare.body.handed_off, undefined, `no handle for a call that cannot run: ${JSON.stringify(bare.body)}`);
  assert.equal(bare.body.clause, "SE-C-136", JSON.stringify(bare.body));

  // Whitespace is not a question.
  const blank = await call(server, "se_test", { files: ["tiny"], force: true, question: "   " });
  assert.equal(blank.body.clause, "SE-C-136", JSON.stringify(blank.body));

  // The battery states no question because its question is fixed.
  const battery = await call(server, "se_test", { force: true });
  assert.equal(battery.body.handed_off, true, JSON.stringify(battery.body));
});
