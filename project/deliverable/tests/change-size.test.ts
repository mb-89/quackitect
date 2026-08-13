// THE BLESSED CHOICE, READ FROM ITS FIELD. One question: which option did the
// person pick?
//
// The field is `<choice> — <why>`. The why is prose, and prose about sizing
// names sizes. So the answer comes from the CHOICE half, and nothing is
// inferred from the sentence beside it.
//
// WHY THIS FILE EXISTS. On 2026-08-13 an iteration was blessed as MINOR and
// pinned as PATCH. The gate validated the choice with one parser; the pin
// re-derived it with another, scanning the whole field for any column name in
// declaration order. `patch` came first, and the reason ended "a new line is
// not a patch".
//
// Eleven approved states were struck and the walk skipped its own build,
// because a patch seeds no chunks. Nothing in the build caught it — it was
// found by reading a pin file by hand, hours later.
//
// TWO PARSERS FOR ONE FACT is the defect this file guards against. There is
// one extractor now, and these cases hold it there.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { chosenOption } from "../engine/stateform.ts";

const SIZES = ["patch", "minor", "major", "product"] as const;

test("the choice is the value, not a word from the reason", () => {
  // The exact field that pinned a minor iteration to patch.
  assert.equal(
    chosenOption(
      "minor — the introspection verb is new capability needing requirement rows that do not exist, and M3_10's own rule says a new line is not a patch",
      SIZES,
    ),
    "minor",
    "the reason may argue about other sizes; only the choice decides",
  );
  assert.equal(chosenOption("major — bigger than a minor, nowhere near a product", SIZES), "major");
  assert.equal(chosenOption("patch — not a minor, and certainly not a major", SIZES), "patch");
});

test("a bare choice needs no reason to be read", () => {
  assert.equal(chosenOption("minor", SIZES), "minor");
  assert.equal(chosenOption("  PRODUCT  ", SIZES), "product");
});

test("only the first line carries the choice", () => {
  assert.equal(
    chosenOption("minor — why\n\nA second paragraph mentioning a major and a product.", SIZES),
    "minor",
    "prose below the line cannot change the pick",
  );
});

test("a field naming no option reads as no choice", () => {
  assert.equal(chosenOption("", SIZES), undefined);
  assert.equal(chosenOption("   ", SIZES), undefined);
  assert.equal(chosenOption("TODO — decide at the gate", SIZES), undefined);
  assert.equal(
    chosenOption("we think this is roughly a minor", SIZES),
    undefined,
    "a size buried in a sentence is not a choice — the field leads with it or it does not count",
  );
});

test("the same extractor serves any choice field, not just the size", () => {
  const verdicts = ["pass", "pass with overrides", "fail"] as const;
  assert.equal(chosenOption("pass — every check green", verdicts), "pass");
  assert.equal(
    chosenOption("fail — the evidence does not stand, so this is no pass", verdicts),
    "fail",
    "a verdict's reason may name another verdict",
  );
});
