// The queue as an outline: a todo placed last stands after the other todos and
// before every row no todo places, so every todo stands above the tickets.
// [[spec/design_output/pull#a-todo-forces-a-place]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { outlineIn } from "../../src/scripts/pull-outline.js";

const row = (name, todo) => ({ name, text: "", front: todo ? { todo } : {} });

// [[spec/design_output/pull#a-todo-forces-a-place]]
test("a todo placed last stands after the other todos and before every untagged row", () => {
  const all = [
    row("a"),
    row("b"),
    row("c"),
    row("review the diff", "last"),
    row("front", "true"),
  ];
  const out = outlineIn([], [], all, all);
  const order = [...out]
    .sort((x, y) => Number(x[1]) - Number(y[1]))
    .map(([name]) => name);
  assert.deepEqual(order, ["front", "review the diff", "a", "b", "c"]);
});

// [[spec/design_output/pull#a-todo-forces-a-place]]
test("a level holding todos alone takes the one placed last at its end", () => {
  const all = [row("one", "true"), row("two", "last")];
  const out = outlineIn([], [], all, all);
  assert.equal(out.get("one"), "1");
  assert.equal(out.get("two"), "2");
});
