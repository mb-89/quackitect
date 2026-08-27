// WHO CAN TAKE WORK, AND WHAT A TAKE SAYS.
//
// THE OFFER HALF OF THIS FILE IS GONE (owner ruling 2026-08-27). Ten cases here
// exercised `offer`, which had no caller anywhere in the engine, so they proved
// a verb no hand could reach. The verb and its cases were deleted together.
//
// WHAT THAT LEAVES UNMET, said here rather than buried: the readiness half of
// tsp-what-is-ready-and-who-can-take-it. Declared dependencies, withholding by
// strength, and the published-difficulty rule are no longer verified, because
// nothing implements them any more.
//
// WHAT STANDS IS THE TAKE, and it is wired: `take` has a real caller on the
// walk, and both ends of it — the mark and the comment — are pinned below.
//
// see dsp-the-work-store.md#both-ends-of-a-piece-of-work-say-something
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { type MintDemand, mint, readOne, take } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";
const HERE = "iterations/i63/decompose";

function home(): string {
  return mkdtempSync(join(tmpdir(), "offered-"));
}

function demand(name: string, extra: Partial<MintDemand> = {}): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, difficulty: "mechanical", ...extra };
}

describe("who can take it", { concurrency: true }, () => {
  test("taking marks the item before the hand acts", () => {
    const h = home();
    const id = mint(h, HERE, [demand("a")], NOW).minted[0].id;
    assert.equal(readOne(h, id)?.taken_by, "");
    take(h, id, "the walker", "picked it up");
    assert.equal(readOne(h, id)?.taken_by, "the walker");
    assert.equal(readOne(h, id)?.status, "in_work", "the mark is what the progress account is derived from");
  });

  test("a second take on the same item is refused, and the refusal names the hand holding it", () => {
    const h = home();
    const id = mint(h, HERE, [demand("a")], NOW).minted[0].id;
    take(h, id, "the walker", "picked it up");
    assert.throws(() => take(h, id, "a guide", "picked it up"), /the walker is already on/);
    assert.equal(readOne(h, id)?.taken_by, "the walker", "the refused take changed nothing");
  });
});

// BOTH ENDS SAY SOMETHING. The close already owed a reason; the take owes one
// too, and neither may be empty.
describe("a take says what it is for", { concurrency: true }, () => {
  test("a take with no comment is refused, and nothing is written", () => {
    const h = home();
    const id = mint(h, HERE, [demand("build it")], NOW).minted[0].id;
    assert.throws(() => take(h, id, "the walker", ""), /a comment on the take/);
    assert.equal(readOne(h, id)?.taken_by, "", "no hand was marked");
    assert.equal(readOne(h, id)?.status, "open", "and the status did not move");
  });

  test("a blank comment is no comment", () => {
    const h = home();
    const id = mint(h, HERE, [demand("build it")], NOW).minted[0].id;
    assert.throws(() => take(h, id, "the walker", "   "), /a comment on the take/);
  });

  test("the comment lands on the item, where a person reads it", () => {
    const h = home();
    const id = mint(h, HERE, [demand("build it")], NOW).minted[0].id;
    take(h, id, "the walker", "starting on the four buckets");
    assert.equal(readOne(h, id)?.took_comment, "starting on the four buckets");
    assert.equal(readOne(h, id)?.status, "in_work");
  });
});
