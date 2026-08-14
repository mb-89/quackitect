// THE ANSWER'S BOUND (tsp-answer-bound). Written test-first at i27's
// author-tests.
//
// ALL THREE CASES ARE RED, and that is the honest state. The engine declares
// no bound at all, so there is nothing to be under or over.
//
// The driver is a use event rather than a grade. Every pull in the session of
// 2026-08-14 returned between 280 and 350 KB and could not be read, and two
// fills were misdirected as a direct result.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import * as tools from "../engine/tools.ts";

/** The bound the engine is meant to declare, wherever it ends up living. */
const declared = (): unknown => (tools as Record<string, unknown>).ANSWER_BOUND_BYTES;

test("the engine declares a bound for an answer", () => {
  assert.equal(
    typeof declared(),
    "number",
    "RED by design. req-the-answer-never-exceeds-its-bound needs a number to be under. No bound is declared anywhere in the engine today.",
  );
});

test("an answer within the bound is returned whole", () => {
  const bound = declared();
  assert.equal(
    typeof bound === "number",
    true,
    "RED by design, and blocked by the case above. Once a bound exists, a small answer must come back untouched — the bound must not cost the common case anything.",
  );
});

test("an answer that would exceed the bound carries a reference to the rest", () => {
  const serves = typeof (tools as Record<string, unknown>).answerByRef === "function";
  assert.equal(
    serves,
    true,
    "RED by design. Cutting an answer without serving the rest turns an unreadable answer into a lost one. The reference is what makes the bound safe.",
  );
});
