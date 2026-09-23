// The tense reader builds its model on the first read, so a verb reading no
// prose skips the build.
// [[spec/design_output/level0#the-tense-reader]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { built, readsAsPast } from "../../src/engine/tense.js";

test("the import builds no model, and the first read builds it", () => {
  assert.equal(built(), false, "an import alone skips the build");
  assert.equal(readsAsPast("the door refused the write", "refused"), true);
  assert.equal(readsAsPast("the door reads the write", "reads"), false);
  assert.equal(built(), true, "the first read builds the model");
});
