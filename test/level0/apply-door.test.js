// The batch edit door: the tools it registers, and the specs the client reads.
// [[spec/design_output/apply#the-write-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PATCH, REPLACE } from "../../.claude/skills/level0/lib/apply.js";
import { UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { SPECS, TOOLS } from "../../src/bridge/apply.js";

test("the door registers a tool for each write verb", () => {
  assert.deepEqual(
    Object.keys(TOOLS).sort(),
    [`mcp__level0__${PATCH}`, `mcp__level0__${REPLACE}`, `mcp__level0__${UNDO}`].sort(),
  );

  for (const call of Object.values(TOOLS)) assert.equal(typeof call, "function");
});

test("each spec names its tool and the shape it takes", () => {
  const said = SPECS();

  assert.deepEqual(said.map((one) => one.name).sort(), [PATCH, REPLACE, UNDO].sort());
  for (const one of said) {
    assert.ok(one.description, `${one.name} says what it does`);
    assert.equal(one.inputSchema.type, "object");
  }
});
