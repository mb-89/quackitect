// The test-run reader in its own file: a whole-suite run refuses, a narrowed one passes.
// [[spec/design_output/bash#a-test-run-points-somewhere]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { testIn } from "../../.claude/skills/level0/lib/bash-test.js";

test("a whole-suite run reads as a test naming no file, and a named file passes", () => {
  assert.deepEqual(testIn("node --test"), ["node --test"]);
  assert.deepEqual(testIn("npm test"), ["npm test"]);
  assert.deepEqual(testIn("node --test test/level0/bash.test.js"), []);
  assert.deepEqual(testIn("npm test -- test/level0/bash.test.js"), []);
});
