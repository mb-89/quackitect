// The transcript reads the bridgehead takes off the session's rows. [[spec/tickets/a-reply-follows-its-prompt]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  beforeOf,
  lastTexts,
  textOf,
} from "../../.claude/skills/level0/hooks/transcript.js";

const ROWS = [
  { role: "user", id: "u1", text: "go" },
  { role: "assistant", uuid: "a1", text: " the first " },
  { role: "user", id: "u2", toolResults: [{}] },
  { role: "assistant", id: "a2", text: "the second" },
];

const $ = { session: { messages: async () => ROWS } };

test("the last texts read the agent's own texts in order, and every row by its role and id", async () => {
  const { texts, rows } = await lastTexts($);
  assert.deepEqual(texts, ["the first", "the second"]);
  assert.deepEqual(rows[1], { role: "assistant", id: "a1", text: "the first" });
  assert.deepEqual(rows[2], { role: "user", id: "u2", results: true });
});

test("a prompt carries the id of the newest row, and another event stays as it stands", async () => {
  assert.deepEqual(await beforeOf($, "prompt.submit", { text: "x" }), {
    text: "x",
    before: "a2",
  });
  assert.deepEqual(await beforeOf($, "tool.call", { tool: "Bash" }), { tool: "Bash" });
});

test("a text chunk gives its text, and any other chunk gives none", () => {
  assert.equal(textOf({ kind: "text", text: "hi" }), "hi");
  assert.equal(textOf({ kind: "tool" }), "");
});
