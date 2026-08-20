// A repeating failure becomes durable work
// (tsp-repeated-failure-shape-becomes-durable-work).
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { asWorkStatement, MISUSE_CLAUSES, recurringShapes, shapeOf } from "../engine/failure-shapes.ts";

const refusal = (clause: string, tool: string) => ({
  tool,
  outcome: "rejected",
  response: { kind: "rejected", clause, expected: "something", got: "something else" },
});

describe("a repeating failure shape becomes work", () => {
  test("one occurrence is not a pattern, and produces nothing", () => {
    assert.deepEqual(recurringShapes([refusal("SE-C-129", "se_run")]), []);
  });

  test("the same shape twice produces exactly one piece of work", () => {
    const found = recurringShapes([refusal("SE-C-129", "se_run"), refusal("SE-C-129", "se_run")]);
    assert.equal(found.length, 1);
    assert.equal(found[0].clause, "SE-C-129");
    assert.equal(found[0].count, 2);
  });

  test("two different shapes stay two, and are never collapsed into one", () => {
    const found = recurringShapes([
      refusal("SE-C-129", "se_run"),
      refusal("SE-C-129", "se_run"),
      refusal("SE-C-123", "se_pull"),
      refusal("SE-C-123", "se_pull"),
    ]);
    assert.equal(found.length, 2, "a counter keyed on 'a refusal happened' would report one");
    assert.deepEqual(new Set(found.map((f) => f.clause)), new Set(["SE-C-129", "SE-C-123"]));
  });

  test("misuse produces none however often it repeats — the system working is not a defect", () => {
    const many = Array.from({ length: 10 }, () => refusal("SE-C-101", "se_test"));
    assert.deepEqual(recurringShapes(many), []);
    assert.equal(MISUSE_CLAUSES.has("SE-C-101"), true);
  });

  test("the same clause from different verbs is not the same shape", () => {
    const found = recurringShapes([refusal("SE-C-129", "se_run"), refusal("SE-C-129", "se_git")]);
    assert.deepEqual(found, [], "one each is not a recurrence for either");
  });

  test("a successful call carries no shape at all", () => {
    assert.equal(shapeOf({ tool: "se_pull", outcome: "result", response: { ok: true } }), undefined);
  });

  test("a refusal stored as a whole string still yields its shape", () => {
    const s = shapeOf({ tool: "se_run", outcome: "rejected", response: JSON.stringify({ clause: "SE-C-137" }) });
    assert.equal(s?.clause, "SE-C-137");
  });

  test("the work it mints carries a statement and a re-entry condition", () => {
    const [shape] = recurringShapes([refusal("SE-C-129", "se_run"), refusal("SE-C-129", "se_run")]);
    const work = asWorkStatement(shape);
    assert.match(work.statement, /SE-C-129/);
    assert.match(work.statement, /2 times/);
    assert.match(work.where, /^ready when/, "a work token without a re-entry condition is refused by the pool");
  });

  test("the sort puts the worst first, because that is what gets picked up", () => {
    const found = recurringShapes([
      refusal("SE-C-123", "se_pull"),
      refusal("SE-C-123", "se_pull"),
      refusal("SE-C-129", "se_run"),
      refusal("SE-C-129", "se_run"),
      refusal("SE-C-129", "se_run"),
    ]);
    assert.equal(found[0].clause, "SE-C-129");
    assert.equal(found[0].count, 3);
  });
});
