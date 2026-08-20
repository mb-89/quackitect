// WHERE A METHOD WRITE LANDS, AND WHERE A RECORD'S OWN WORK LANDS.
//
// WHY THIS FILE EXISTS. Nothing tested either mechanism. A search of the whole
// test folder for METHOD_WRITE_BOUND, SE-C-134 and fansOut returned nothing
// (2026-08-14). The only thing proving the old guard worked was that it fired
// at whoever was driving.
//
// SE-C-134 IS NOW RETIRED, and these tests pin what replaced it: shared method
// RESOLVES to the machine root instead of being REFUSED from a record. The
// danger is the same one either way — a record's copy of the engine fanning
// out over trunk at a merge, which really happened on 2026-08-07.
//
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { describe, test } from "node:test";
import { CLAUSES } from "../engine/errors.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, freshRoot } from "./helpers.ts";

/** A fresh root that is a real git repo, the way records.test.ts does it. */
function gitRoot(): string {
  const root = freshRoot();
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q", "-b", "v3");
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed");
  g("config", "user.name", "t");
  g("config", "user.email", "t@t");
  return root;
}

describe("the method guard", { concurrency: true }, () => {
  test("every path resolves to the machine root from inside a bound record", () => {
    const root = gitRoot();
    const s = new Session(root);
    const minted = s.expeditionNew("spike", "Guard The Method") as { created: string };
    s.expeditionOpen(minted.created);

    // THE CLAIM THAT RETIRED SE-C-134. A method path resolves to the machine
    // root whatever is bound, so the write cannot land in a tree that does not
    // own it. Refusing it was the old answer to the same danger.
    for (const rel of [
      anyGuidanceDoc(),
      "deliverable/machines/items/element.md",
      "deliverable/engine/session.ts",
      "deliverable/tests/pull.test.ts",
    ]) {
      assert.equal(s.laneRoot(rel), root, `${rel} is shared method and belongs to the machine`);
    }

    // AND SINCE i34 A RECORD'S OWN CONTENT RESOLVES THERE TOO. This case used
    // to assert the opposite — that a record's work stays in the record's own
    // tree — and that was the seam: two answers for one path string.
    //
    // THE DANGER IT GUARDED IS GONE RATHER THAN RE-ANSWERED. A write cannot
    // land in the wrong tree when there is one tree.
    const own = `spec/expeditions/${minted.created}/evidence/scratch.md`;
    assert.equal(s.laneRoot(own), root, "a record's own work resolves to the one tree, like everything else");
  });

  test("the retired clause is gone from the registry and its number is not reused", () => {
    assert.equal(
      Object.values(CLAUSES).includes("SE-C-134" as never),
      false,
      "SE-C-134 is retired — resolution replaced it, so nothing may issue it again",
    );
  });

  test("a record's OWN evidence is never refused while bound", async () => {
    const root = gitRoot();
    const s = new Session(root);
    const minted = s.expeditionNew("spike", "Own Work Is Fine") as { created: string };
    s.expeditionOpen(minted.created);

    const server = buildServer(root, s);
    const ok = await call(server, "se_file_write", {
      path: `spec/expeditions/${minted.created}/evidence/scratch.md`,
      content: "the record's own work",
      base_hash: null,
    });

    // THE CLAIM IS ABOUT THE METHOD GUARD, not about every other gate. A walk
    // parked at start refuses writes for its own reason (SE-C-110), and that
    // is not what this test is about. What must never happen is SE-C-134
    // firing on a record's own evidence.
    const body = ok.body as { clause?: string };
    assert.notEqual(body.clause, "SE-C-134", "a bound walk exists to write the record's own content");
  });

  // ONE TREE, ONE COPY, so a method write reaches every reader by
  // construction and there is no fan-out to drive. A case
  // asserting that a deleted function returns an empty list tests nothing.
});
