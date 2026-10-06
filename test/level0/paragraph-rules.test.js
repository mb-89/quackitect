// The paragraph schema's rules project their heads, with the schema's values in the message.
// [[spec/design_output/projection#a-layer-writes-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { codeSpans, restatedTable } from "../../.claude/skills/level0/lib/paragraph-rules.js";

test("the code spans rule names the layer's most and carries no script body", () => {
  const said = codeSpans({ codeSpans: "3" });
  assert.match(said, /^message: "A sentence holds 3 code spans\."$/m);
  assert.doesNotMatch(said, /^script:/m);
});

test("the restated table rule carries no script body", () => {
  assert.doesNotMatch(restatedTable(), /^script:/m);
});
