// The transcript reads the bridgehead takes off the session's rows. [[spec/tickets/a-reply-follows-its-prompt]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  beforeIn,
  rawRows,
  textOf,
  textsOf,
} from "../../.claude/skills/level0/hooks/transcript.ts";

const ROWS = [
  { role: "user", id: "u1", text: "go" },
  { role: "assistant", uuid: "a1", text: " the first " },
  { role: "user", id: "u2", toolResults: [{}] },
  { role: "assistant", id: "a2", text: "the second" },
];

// [[spec/tickets/level0-hooks-hold-no-rule]]
test("the raw rows ride as the engine hands them, a nested list as its count, newest kept where the post runs full", () => {
  assert.deepEqual(rawRows(ROWS), [
    { role: "user", id: "u1", text: "go" },
    { role: "assistant", uuid: "a1", text: " the first " },
    { role: "user", id: "u2", toolResults: 1 },
    { role: "assistant", id: "a2", text: "the second" },
  ]);
  assert.deepEqual(rawRows(null), []);
  const long = Array.from({ length: 300 }, (_, at) => ({ role: "assistant", id: `r${at}`, text: "x".repeat(2000) }));
  const kept = rawRows(long);
  assert.ok(kept.length < long.length, "a transcript past the room rides cut");
  assert.equal(kept.at(-1).id, "r299", "and keeps its newest row");
});

// The old door's trim, which the bridgehead keeps until no door reads it. [[spec/tickets/level0-hooks-hold-no-rule]]
test("the last texts read the agent's own texts in order, and every row by its role and id", () => {
  const { texts, rows } = textsOf(ROWS);
  assert.deepEqual(texts, ["the first", "the second"]);
  assert.deepEqual(rows[1], { role: "assistant", id: "a1", text: "the first" });
  assert.deepEqual(rows[2], { role: "user", id: "u2", results: true });
  assert.deepEqual(textsOf(null), { texts: [], rows: [] });
});

test("a prompt carries the id of the newest row, and no row leaves it as it stands", () => {
  assert.deepEqual(beforeIn({ text: "x" }, ROWS), { text: "x", before: "a2" });
  assert.deepEqual(beforeIn({ text: "x" }, []), { text: "x" });
});

test("a text chunk gives its text, and any other chunk gives none", () => {
  assert.equal(textOf({ kind: "text", text: "hi" }), "hi");
  assert.equal(textOf({ kind: "tool" }), "");
});
