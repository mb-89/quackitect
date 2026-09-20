// The lint's reading of a tree: the warnings stand as a list the stamp
// carries, and the list stands empty before any lint runs.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { version, warningsStood } from "../../src/scripts/cli-read.js";

// A warning lands under every door, and the refactoring hand drains the list the stamp carries. [[spec/design_output/config#the-engine-controls]]
test("the warnings stand as a list, empty before any lint, and the version reads as text", () => {
  assert.deepEqual(
    warningsStood(),
    [],
    "the warnings stand as an empty list before any lint",
  );
  assert.equal(typeof version(), "string");
  assert.notEqual(version(), "", "the version names something, or the fallback");
});
