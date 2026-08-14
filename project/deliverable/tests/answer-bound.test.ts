// THE ANSWER'S BOUND (tsp-answer-bound). Authored test-first at i27's
// author-tests, turned green by the answer-bound chunk.
//
// The driver is a use event rather than a grade. Every pull in the session of
// 2026-08-14 returned between 280 and 350 KB and could not be read, and two
// fills were misdirected as a direct result.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { ANSWER_BOUND_BYTES, boundAnswer } from "../engine/bound.ts";

test("the engine declares a bound for an answer", () => {
  assert.equal(typeof ANSWER_BOUND_BYTES, "number");
  assert.equal(ANSWER_BOUND_BYTES > 0, true, "a bound of zero would send nothing at all");
});

test("an answer within the bound is returned whole", () => {
  const payload = { where: ["iterations/i27/specify-build"], do: "work the state" };
  const answered = boundAnswer("se_pull", payload);
  assert.equal(answered.cut, false, "the bound must not cost the common case anything");
  assert.deepEqual(JSON.parse(answered.text), payload, "a small answer comes back byte for byte");
});

test("an answer that would exceed the bound carries a reference to the rest", () => {
  const huge = { rows: Array.from({ length: 20_000 }, (_, i) => `row ${i} of a scenario deck`) };
  const answered = boundAnswer("se_pull", huge);
  assert.equal(answered.cut, true);
  assert.equal(answered.text.length < ANSWER_BOUND_BYTES, true, "the stand-in must itself fit");

  const pointer = JSON.parse(answered.text);
  assert.equal(pointer.bounded, true);
  assert.equal(pointer.bytes, answered.bytes, "the pointer says how big the whole answer was");
  assert.equal(pointer.remedy.tool, "se_log_query", "a reference nobody can follow is not a reference");
  assert.deepEqual(pointer.remedy.args, { filter: { tool: "se_pull" }, limit: 1 });
});

test("the size of the whole answer is reported even when it fits", () => {
  const answered = boundAnswer("se_note", { captured: "note-1" });
  assert.equal(answered.cut, false);
  assert.equal(answered.bytes, answered.text.length, "a reader can see the shape of the problem before it bites");
});
