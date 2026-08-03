// WHAT A CHANGE SIZE ACTUALLY CHANGES.
//
// The prep document said `product` "compiles to a machine identical to
// `major` — same 51 states, same identifiers", and reached for a decision
// about what to do with a size that means nothing.
//
// The state SET is the same. The machines are not. compileColumn joins each
// cell's own body to the row's guidance, so all 51 states carry different
// instructions at product than at major. That IS the owner's answer to what
// product is for: not a different structure, a heavier front.
//
// This file holds that, because the distinction lives entirely in authored
// prose and prose is what silently collapses.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CHANGE_COLUMNS, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const REPO = fileURLToPath(new URL("../../..", import.meta.url));
const mx = readRigorMatrix(REPO);
const compiled = new Map(CHANGE_COLUMNS.map((c) => [c, compileColumn(mx, c)]));

/** Every state's instructions, as one comparable value. */
const instructions = (column: string): string =>
  JSON.stringify(compiled.get(column as (typeof CHANGE_COLUMNS)[number])!.states.map((s) => [s.id, s.guidance]));

describe("the sizes are not the same walk", () => {
  test("each size strikes a different number of steps", () => {
    const counts = CHANGE_COLUMNS.map((c) => compiled.get(c)!.states.length);
    assert.ok(counts[0] < counts[1], "patch strikes more than minor");
    assert.ok(counts[1] < counts[2], "minor strikes more than major");
  });

  // The one the prep document got wrong.
  test("product and major share a state set and share no guidance", () => {
    const major = compiled.get("major")!;
    const product = compiled.get("product")!;
    assert.deepEqual(
      major.states.map((s) => s.id),
      product.states.map((s) => s.id),
      "the same steps",
    );
    const differing = major.states.filter((s, i) => s.guidance !== product.states[i].guidance);
    assert.equal(differing.length, major.states.length, "and every one of them instructs differently");
  });

  test("no size compiles to instructions identical to another", () => {
    for (const a of CHANGE_COLUMNS) {
      for (const b of CHANGE_COLUMNS) {
        if (a === b) continue;
        assert.notEqual(instructions(a), instructions(b), `${a} and ${b} compile to the same instructions`);
      }
    }
  });
});

describe("the front is heavier at product, and that is the whole difference", () => {
  // The owner's ruling: a product iteration defines the vision, the
  // stakeholders and the early phases for the WHOLE product. Later iterations
  // inherit those and define design input only for their own scope.
  const FRONT = ["draft-vision", "define-actual", "map-stakeholders"];

  for (const step of FRONT) {
    test(`${step} applies in full at product and is tailored or inherited below it`, () => {
      const cells = mx.cells.get(step);
      assert.ok(cells !== undefined, `${step} is a row`);
      assert.equal(cells.get("product")?.applies, "full", "product authors it for the whole product");
      assert.notEqual(cells.get("major")?.applies, "full", "major does not re-author the product's vision");
      assert.equal(cells.get("minor")?.applies, "inherit", "minor takes it by pointer");
      assert.equal(cells.get("patch")?.applies, "none", "a patch never touches it");
    });
  }

  test("product outranks major only on front steps", () => {
    const rank: Record<string, number> = { none: 0, inherit: 1, tailored: 2, full: 3 };
    const outranks = mx.rows
      .filter(
        (r) =>
          (rank[mx.cells.get(r.name)?.get("product")?.applies ?? ""] ?? 0) > (rank[mx.cells.get(r.name)?.get("major")?.applies ?? ""] ?? 0),
      )
      .map((r) => r.name);
    assert.ok(outranks.length > 0, "product outranks major somewhere, or the size means nothing");
    const FRONT_PREFIXES = [
      "draft-",
      "define-",
      "map-",
      "write-",
      "frame-",
      "scope-",
      "pressure-",
      "log-risks",
      "generalize-",
      "draw-",
      "gate-motivation",
      "gate-inputs",
    ];
    for (const name of outranks) {
      assert.ok(
        FRONT_PREFIXES.some((p) => name.startsWith(p)),
        `${name} outranks major but is not a front step`,
      );
    }
  });
});
