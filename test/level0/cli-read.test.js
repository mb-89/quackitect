// The lint's reading of a tree: the warnings stand as a list the stamp
// carries, and the sentence the lint ends on says where they go.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { warningsStood } from "../../src/scripts/cli-read.js";

// A warning lands under every door, and the refactoring hand drains it, so the lint says so and names no push it holds. [[spec/design_output/config#the-engine-controls]]
test("the warnings stand as a list, and the lint's last line names the hand and no held push", () => {
  assert.ok(
    Array.isArray(warningsStood()),
    "the warnings stand as a list before any lint",
  );
  const text = readFileSync(
    new URL("../../src/scripts/cli-read.js", import.meta.url),
    "utf8",
  );
  assert.match(text, /the refactoring hand drains them/);
  assert.doesNotMatch(text, /no push reaches/);
});
