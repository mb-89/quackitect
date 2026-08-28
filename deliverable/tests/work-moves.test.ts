// see dsp-the-work-store.md#behavior-and-constraints
//
// EVERY MOVE IS ASSERTED AT BOTH ENDS, in one case. Separate cases can both
// pass while the two ends disagree, and work owed twice is exactly the failure
// this file exists to catch.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { openPointsAt } from "../engine/workoffer.ts";
import { BACKLOG, type MintDemand, mint, place as placeAt, readOne } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";
const HERE = "iterations/i63/decompose";
const THERE = "iterations/i63/evaluate";

function home(): string {
  return mkdtempSync(join(tmpdir(), "moves-"));
}

function demand(name: string): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name };
}

function one(h: string, name = "elements"): string {
  return mint(h, HERE, [demand(name)], NOW).minted[0].id;
}

/** The store's own verb with the usual destination filled in, so a case reads
 *  as the move it is testing rather than as its arguments. */
function place(h: string, id: string, to: string = THERE): { from: string; to: string } {
  return placeAt(h, id, to);
}

describe("work moves and the two ends agree", { concurrency: true }, () => {
  test("placing makes the destination owe it and releases the origin, in one act", () => {
    const h = home();
    const id = one(h);
    assert.equal(openPointsAt(h, HERE).length, 1);
    assert.equal(openPointsAt(h, THERE).length, 0);

    const moved = place(h, id);
    assert.equal(moved.from, HERE);
    assert.equal(moved.to, THERE);

    assert.equal(openPointsAt(h, HERE).length, 0, "the origin was released");
    assert.equal(openPointsAt(h, THERE).length, 1, "the destination owes it");
  });

  test("a position whose last item moved away can be left", () => {
    const h = home();
    place(h, one(h));
    assert.deepEqual(openPointsAt(h, HERE), [], "moved is a real exit, not a failure to settle");
  });

  test("moving back restores both ends exactly, with no residue", () => {
    const h = home();
    const id = one(h);
    place(h, id);
    place(h, id, HERE);
    assert.equal(openPointsAt(h, HERE).length, 1);
    assert.equal(openPointsAt(h, THERE).length, 0);
    assert.equal(readOne(h, id)?.place, HERE);
  });

  test("placing where it already sits changes nothing and is not an error", () => {
    const h = home();
    const id = one(h);
    const again = place(h, id, HERE);
    assert.equal(again.from, HERE);
    assert.equal(again.to, HERE);
    assert.equal(openPointsAt(h, HERE).length, 1);
  });

  test("a position holding one item holds none after the move out", () => {
    const h = home();
    const id = one(h);
    assert.equal(openPointsAt(h, HERE).length, 1);
    place(h, id, BACKLOG);
    assert.equal(openPointsAt(h, HERE).length, 0, "an empty position is where a wrong count hides");
    assert.equal(openPointsAt(h, BACKLOG).length, 1);
  });
});
