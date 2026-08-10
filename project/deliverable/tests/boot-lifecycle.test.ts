// End-to-end boot lifecycle behavior. Its own file gives these CPU-heavy
// session walks an independent battery worker.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { bootedServer, call, checkDocs, freshRoot } from "./helpers.ts";

describe("boot lifecycle", { concurrency: true }, () => {
  test("idle opens the whole lane; pulling to end closes it; after the close the pull still answers", async () => {
    const root = freshRoot();
    const server = await bootedServer(root);
    const write = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
    assert.equal(write.isError, false);
    const first = await call(server, "se_pull");
    const offer = first.body.pull === "do" ? await call(server, "se_pull") : first;
    assert.equal(offer.body.pull, "wait", JSON.stringify(offer.body));
    const exit = await call(server, "se_pull", { form: { choice: "end" } });
    assert.equal(exit.isError, false, JSON.stringify(exit.body));
    const initialRest = await call(server, "se_pull");
    const rest = initialRest.body.pull === "do" ? await call(server, "se_pull") : initialRest;
    assert.equal(rest.body.pull, "wait", JSON.stringify(rest.body));
    const after = await call(server, "se_file_read", { path: "x.md" });
    assert.equal(after.isError, true);
    assert.equal(after.body.clause, "SE-C-110");
  });

  test("manual mode: tick info at start, the human's steps walk the whole machine to end", async () => {
    const root = freshRoot();
    const session = new Session(root);
    const info = session.packet() as { active: string[]; states: { kind: string }[] };
    assert.deepEqual(info.active, ["start"]);
    assert.equal(info.states[0].kind, "start");
    await session.advance();
    assert.deepEqual(session.active(), ["boot/start"]);
    await session.advance();
    assert.deepEqual(session.active(), ["boot/read_contract"]);
    checkDocs(session);
    await session.advance();
    assert.deepEqual(session.active(), ["boot/prepare_idle"]);
    await session.advance();
    assert.deepEqual(session.active(), ["boot/end"]);
    await session.advance();
    assert.deepEqual(session.active(), ["idle"]);
    await assert.rejects(
      () => session.advance(),
      (error) => (error as { clause?: string }).clause === "SE-C-110",
    );
    await session.advance("expeditions");
    assert.deepEqual(session.active(), ["expeditions/start"]);
    await session.advance();
    assert.deepEqual(session.active(), ["expeditions/end"]);
    await session.advance();
    assert.deepEqual(session.active(), ["idle"]);
    await session.advance("end");
    assert.equal((session.describe() as { status: string }).status, "closed");
  });
});
