// Agent-facing boot behavior. Separate from boot.test.ts so the battery can
// schedule integration-heavy boot paths on another worker.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, proofFor, pullBoot } from "./helpers.ts";

describe("agent boot", { concurrency: true }, () => {
  test("the agent's pulls walk boot: the reading gates, the machine walks, the banner survives the sweep", async () => {
    const root = freshRoot();
    const server = buildServer(root);
    const first = await call(server, "se_pull");
    assert.equal(first.body.pull, "read");
    const again = await call(server, "se_pull");
    assert.equal(again.body.pull, "read", "no way forward except the reading");
    const shut = await call(server, "se_run", { command: "echo nope" });
    assert.equal(shut.body.clause, "SE-C-110");
    let result = await call(server, "se_pull");
    for (let index = 0; index < 40; index++) {
      const doc = result.body.document as { content?: string } | undefined;
      if (doc?.content === undefined) break;
      result = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
    }
    assert.equal(result.body.pull, "do", JSON.stringify(result.body));
    assert.equal(result.body.arrived, true);
    assert.ok((result.body.walked as string[]).length > 3, "the whole branchless way in one pull");
    const banners = (result.body.banners ?? []) as string[];
    assert.ok(
      banners.some((banner) => banner.includes("Main machine is live")),
      `boot's banner rides the answer: ${JSON.stringify(result.body)}`,
    );
    const later = await call(server, "se_pull");
    assert.equal(later.body.banners, undefined);
  });

  test("the gate is logged like everything else - a refused pre-boot call lands in the log", async () => {
    const root = freshRoot();
    const server = buildServer(root);
    await call(server, "se_run", { command: "echo nope" });
    await pullBoot(server);
    const query = await call(server, "se_log_query", { filter: { ok: false } });
    const records = query.body.records as { tool: string; outcome: string }[];
    assert.equal(records.length, 1);
    assert.equal(records[0].tool, "se_run");
    assert.equal(records[0].outcome, "rejected");
  });
});
