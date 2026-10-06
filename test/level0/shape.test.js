// The pure shapes the bridgehead builds an answer and a row with. [[spec/design_output/level0#the-bridgehead-and-the-server]]

import assert from "node:assert/strict";
import test from "node:test";
import { merged } from "../../.claude/skills/level0/hooks/shape.ts";

test("a merge grows a list, puts a text below the one standing, and replaces anything else", () => {
  assert.deepEqual(
    merged(
      { context: ["a"], note: "one", n: 1 },
      { context: ["b"], note: "two", n: 2 },
    ),
    { context: ["a", "b"], note: "one\n\ntwo", n: 2 },
  );
  assert.deepEqual(merged(null, { context: ["b"] }), { context: ["b"] });
});
