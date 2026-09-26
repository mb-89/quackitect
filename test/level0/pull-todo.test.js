// The pull while a todo stands in hand: it answers that todo and hands out
// nothing else, the way a held ticket holds the hand.
// [[spec/tickets/the-todo-joins-the-queue]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, heard, ROOT, standing } from "./pull-doors.js";

const PLAN = {
  [at(".se/.runtime/plan.json")]: JSON.stringify({
    working: "fix the door",
    todos: [],
    places: {},
  }),
};

// [[spec/tickets/the-todo-joins-the-queue]]
test("a working todo answers the pull, and the pull hands out nothing else", () => {
  const { it } = doors({ ...standing(CHILD()), ...PLAN });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0, said);
  assert.match(said, /fix the door/, "the pull names the todo");
  assert.doesNotMatch(said, /a-child at design\/draft/, "and hands out no ticket");
});

// The todo road stands ahead of the named road, so a name hands nothing out either. [[spec/tickets/the-todo-road-stands-first]]
test("a named pull while a todo stands in hand answers the todo", () => {
  const { it } = doors({ ...standing(CHILD()), ...PLAN });
  const { said } = heard(() => pulling(ROOT, ["pull", "a-child"], it));
  assert.match(said, /fix the door/);
  assert.doesNotMatch(said, /a-child at design\/draft/);
});

// [[spec/tickets/the-todo-joins-the-queue]]
test("with no working todo the pull hands out as before", () => {
  const { it } = doors(standing(CHILD()));
  const { said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.match(said, /a-child at design\/draft/);
});
