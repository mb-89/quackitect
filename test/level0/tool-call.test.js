// A verb renders as the index tool standing for it, with its words as the
// args array the tool takes.
// [[spec/tickets/verb-outputs-name-index-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ASKS } from "../../src/scripts/ephemeral.js";
import { spawnPrompt } from "../../src/scripts/pull-spawn.js";
import { callOf } from "../../src/scripts/tool-call.js";

test("a verb renders as its tool, and its words as the args array", () => {
  assert.equal(callOf("ticket", "pull"), "mcp__level0__index_ticket_pull");
  assert.equal(
    callOf("ticket", "pull", ["a-ticket", "--pass"]),
    'mcp__level0__index_ticket_pull with args ["a-ticket","--pass"]',
  );
});

test("a spawn prompt names the tool calls and no shell verb", () => {
  const said = spawnPrompt("a-ticket", { path: "gate", evidence: [] }, "helper-1");
  assert.match(said, /mcp__level0__index_ticket_pull with args \["--as","helper-1"\]/);
  assert.doesNotMatch(said, /\.\/RUNME\.sh/);
});

test("the ephemeral asks hand back through the tool", () => {
  const said = Object.values(ASKS).flat().join("\n");
  assert.match(said, /mcp__level0__index_ticket_pull with args \["--pass"\]/);
  assert.doesNotMatch(said, /\.\/RUNME\.sh/);
});
