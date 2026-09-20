// The hand tools: the draft check over an answer, and the mint writing a note
// under its schema.
// [[spec/design_output/level0#the-tool-reads-a-draft]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { CHECK } from "../../.claude/skills/level0/lib/answer.js";
import { MINT_TOOL } from "../../.claude/skills/level0/lib/schema.js";
import { SPECS, TOOLS } from "../../src/bridge/tools.js";

test("the door registers the check and the mint", () => {
  assert.deepEqual(
    Object.keys(TOOLS).sort(),
    [`mcp__level0__${CHECK}`, `mcp__level0__${MINT_TOOL}`].sort(),
  );
});

test("the specs read the schemas the box holds", () => {
  const said = SPECS({ schemas: [{ kind: "ticket" }] });

  assert.deepEqual(said.map((one) => one.name).sort(), [CHECK, MINT_TOOL].sort());
  for (const one of said) assert.equal(one.inputSchema.type, "object");
});

test("a draft of no text comes back said", async () => {
  const said = await TOOLS[`mcp__level0__${CHECK}`]({ text: "  " }, {});

  assert.match(said.result.result, new RegExp(CHECK));
});
