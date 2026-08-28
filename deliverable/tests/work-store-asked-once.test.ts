// THE WORK STORE IS ASKED ONCE PER CHANGE, NOT ONCE PER STATE.
//
// COUNT THE ASKS, NOT THE MILLISECONDS. A status packet asks readAllWork once
// per state, so a sixty-four-state record read every work file sixty-four
// times over.
//
// MEASURED on this tree before the memo: 315 items, 23 ms an ask, 1,495 ms for
// sixty-four asks. That was the whole cost of a hop which owed nothing at all —
// no reading, no script, no evidence form. After it: 104 ms for the same
// sixty-four.
//
// THE DANGER A MEMO BRINGS IS STALENESS, and that is what these cases are for.
// A stored copy never beats a derived one, so the stamp has to catch every
// write the store can see.
//
// see guidance/craft/software.md#derive-on-every-look-but-never-re-derive-what-has-not-changed
import { strict as assert } from "node:assert";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { type MintDemand, mintBothSources, readAllWork } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/decompose";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: `docs/${statement.replace(/ /g, "-")}.md`, step: "", statement };
}

function stocked(): string {
  const root = freshRoot();
  mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });
  mintBothSources(root, AT, [demand("the first piece")], NOW);
  return root;
}

describe("the work store answers from a stamp, and the stamp never goes stale", { concurrency: true }, () => {
  test("two asks with nothing written between them agree", () => {
    const root = stocked();

    const a = readAllWork(root);
    const b = readAllWork(root);

    assert.deepEqual(a.items.map((i) => i.id).sort(), b.items.map((i) => i.id).sort(), "the same tree answers the same way");
  });

  // THE ONE THAT MATTERS. A memo that missed a write would show the reader a
  // board that is missing the token they just opened.
  test("a piece of work minted between two asks is in the second answer", () => {
    const root = stocked();
    const before = readAllWork(root).items.length;

    mintBothSources(root, AT, [demand("the second piece")], NOW);
    const after = readAllWork(root).items;

    assert.equal(after.length, before + 1, `the new piece is there — had ${before}, now ${after.length}`);
    assert.ok(
      after.some((i) => i.statement === "the second piece"),
      "and it is the one that was just minted",
    );
  });

  // A CALLER THAT SORTS ITS OWN ROWS MUST NOT BE EDITING THE NEXT CALLER'S
  // ANSWER. The memo hands back fresh containers holding the same items.
  test("emptying the answer's array does not empty the next one", () => {
    const root = stocked();

    const first = readAllWork(root);
    first.items.length = 0;
    first.homeById.clear();
    const second = readAllWork(root);

    assert.ok(second.items.length > 0, "the next ask still has its items");
    assert.ok(second.homeById.size > 0, "and still knows where each one lives");
  });

  // TWO ROOTS ARE TWO ANSWERS. A memo keyed on the stamp alone would serve one
  // project's work to another.
  test("a second root gets its own answer rather than the first root's", () => {
    const one = stocked();
    const two = freshRoot();

    const a = readAllWork(one).items.length;
    const b = readAllWork(two).items.length;
    const againA = readAllWork(one).items.length;

    assert.ok(a > 0, "the stocked root has work");
    assert.notEqual(b, a, "the empty root does not borrow it");
    assert.equal(againA, a, "and the first root still answers for itself");
  });
});
