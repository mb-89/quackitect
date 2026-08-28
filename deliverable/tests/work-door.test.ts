// THE DOOR ONTO A PIECE OF WORK.
//
// The store refused an empty comment for a while and nothing could trip the
// refusal, because no verb reached take or settle. A rule nothing can trip is
// not a rule, so these cases walk the whole wire: the verb, the session, the
// store, and the feed line that follows from the call.
//
// see dsp-the-work-store.md#the-door-is-one-verb-with-three-acts
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { sessionTools } from "../engine/tools.ts";
import { type MintDemand, mint, readOne } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-08-26T10:00:00Z";
const REPO = fileURLToPath(new URL("..", import.meta.url));

function engine(file: string): string {
  return readFileSync(join(REPO, "engine", file), "utf8");
}

function demand(name: string): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, difficulty: "mechanical" };
}

describe("the verb, and both ends of the wire", { concurrency: false }, () => {
  test("se_work is offered, and its comment is required", () => {
    const def = sessionTools(new Session(freshRoot())).find((t) => t.name === "se_work");
    assert.notEqual(def, undefined, "the verb exists");
    const schema = def?.inputSchema as { required?: string[]; properties?: Record<string, unknown> };
    assert.deepEqual(schema.required, ["act", "id", "comment"], "no act reaches the store without a comment");
    assert.notEqual(schema.properties?.status, undefined, "a settle may say the work stopped rather than finished");
  });

  test("a work line is its own kind in the feed, with its own colour", () => {
    assert.match(
      engine("render.ts"),
      /rec\.tool === "se_work" \|\| rec\.tool === "mirror_work_act"/,
      "the feed tells a work line apart from a call, from the lane and from the surface alike",
    );
    const palette = readFileSync(join(REPO, "brand", "palette.css"), "utf8");
    assert.match(palette, /--se-feed-kind-work:/, "and it carries a colour of its own");
  });

  test("take and settle reach the store, and the comment lands on the item", async () => {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    for (let i = 0; i < 2; i++) await session.advance();
    checkDocs(session);
    for (let i = 0; i < 3; i++) await session.advance();
    session.setAutonomy(1);
    const id = String(session.iterationSeed("prove the door", "a hand reports on its own work").seeded);
    pinIteration(root, itFind(root, id), "major");
    session.iterationOpen(id);

    const home = String(session.boundRecordHome());
    const work = mint(home, `iterations/${id}/write-requirements`, [demand("build it")], NOW).minted[0].id;

    assert.throws(() => session.workAct("take", work, ""), /a comment on the take/, "an empty comment is refused at the door");

    session.workAct("take", work, "starting on it");
    assert.equal(readOne(home, work)?.took_comment, "starting on it");
    assert.equal(readOne(home, work)?.status, "in_work");

    session.workAct("settle", work, "the buckets draw");
    assert.equal(readOne(home, work)?.status, "done");
    assert.equal(readOne(home, work)?.reason, "the buckets draw", "the comment is on the item, not only in a log");
  });

  test("an act nobody recognises names the three that exist", () => {
    assert.throws(() => new Session(freshRoot()).workAct("finish", "anything", "a comment"), /take, settle or restate/);
  });
});
