// The tense reader builds its model on the first read, so a verb reading no
// prose skips the build.
// [[spec/design_output/level0#the-tense-reader]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readsAsPast } from "../../src/engine/tense.js";

// The unit tests share one process, so the case takes a module of its own, which no other file has read through. [[spec/tickets/the-tests-start-fewer-processes]]
const fresh = await import("../../src/engine/tense.js?a-fresh-import");

test("the import builds no model, and the first read builds it", () => {
  assert.equal(fresh.built(), false, "an import alone skips the build");
  assert.equal(fresh.readsAsPast("the door refused the write", "refused"), true);
  assert.equal(fresh.readsAsPast("the door reads the write", "reads"), false);
  assert.equal(fresh.built(), true, "the first read builds the model");
});

test("a match holding no letter reads as no past tense", () => {
  assert.equal(readsAsPast("| the part | what it holds |", "|"), false);
});
