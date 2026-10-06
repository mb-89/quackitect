// A projected script rule carries its head alone, since the Go scripts dispatch by name.
// [[spec/design_output/projection#a-layer-writes-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { head, scripted } from "../../.claude/skills/level0/lib/snippets.js";

test("a scripted rule is its head and no script body", () => {
  const said = scripted("A sentence holds two code spans.");
  assert.equal(said, `${head("A sentence holds two code spans.")}\n`);
  assert.doesNotMatch(said, /^script:/m);
  assert.match(said, /^scope: raw$/m);
});
