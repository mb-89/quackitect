// THE FIRE-AND-FORGET VERDICT: a handed-off test run's verdict must land in
// the call log BY ITSELF (an se_test_verdict record) — an unfetched failure
// must not be invisible to the retro.
//
// SEQUENTIAL ON PURPOSE: the case writes process.env to force the handoff.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { bootedServer, call, freshRoot } from "./helpers.ts";

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
  process.env.SE_TEST_HANDOFF_MS = "1";
  try {
    const started = await call(server, "se_test", { files: ["tiny"], force: true });
    assert.equal(started.body.handed_off, true, JSON.stringify(started.body));
    const job = String(started.body.job);
    let v: Record<string, unknown> = {};
    for (let i = 0; i < 120; i++) {
      v = (await call(server, "se_test", { job, wait_ms: 1000 })).body;
      if (v.running === false) break;
    }
    assert.equal(v.running, false, `the run finished: ${JSON.stringify(v)}`);
    // The verdict was fetched above only to WAIT — the log record must exist
    // regardless, written by the completion handler, not by the fetch.
    const q = await call(server, "se_log_query", { filter: { tool: "se_test_verdict" } });
    const recs = q.body.records as { args: { job: string }; ok: boolean }[];
    assert.equal(recs.length, 1, `the verdict logged itself: total ${String(q.body.total)}`);
    assert.equal(recs[0].args.job, job);
    assert.equal(recs[0].ok, true, "tiny.test.ts is green, so the verdict is too");
  } finally {
    delete process.env.SE_TEST_HANDOFF_MS;
  }
});
