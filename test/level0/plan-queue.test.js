// The plan door over a queue: a place digit reads the queue order, and the
// answer names the place each new todo takes. Git answers from a table, so the
// queue stands three tickets deep.
// [[spec/design_output/stop#the-plan]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { PLAN_CALL, plansHere, TOOLS } from "../../src/bridge/plan.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { remoteSaying, ROOT } from "./work-doors.js";

const TICKET = `---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change the ask names
---

# Ask

One piece of it.

# do

# Discussion
`;
const NAMES = ["a-first", "b-second", "c-third"];

// [[spec/design_output/stop#the-plan]]
function box() {
  const objects = Object.fromEntries(
    NAMES.map((name) => [`origin/main:spec/tickets/${name}.md`, TICKET]),
  );
  const git = fakeGit(remoteSaying([], objects), ROOT);
  return {
    disk: fakeDisk({
      [join(ROOT, "spec", "config", "level0.json")]: JSON.stringify({
        plan: { everyCalls: 10, mostOpen: 4, grace: 1 },
        work: { blockScore: 1, dayScore: 1, failScore: 1 },
      }),
    }),
    proc: git.proc,
    env: {},
    work: ROOT,
    method: ROOT,
    clock: fakeClock("2026-09-20T10:00:00.000Z"),
    log: { say: () => {} },
  };
}

const plan = TOOLS[PLAN_CALL];
const todoOf = (it, title) => plansHere(it).todos.find((one) => one.title === title)?.todo;

// A digit names the row at that place in the queue, whatever the plan's own todos say. [[spec/design_output/pull#a-todo-forces-a-place]]
test("a digit of two anchors the todo before the ticket at place two", () => {
  const it = box();
  plan({ add: [{ title: "an earlier todo", place: 1 }] }, it);

  plan({ add: [{ title: "read the note", place: 2 }] }, it);

  assert.equal(todoOf(it, "read the note"), "a-first", "the row at place two, past the first todo");
});

// [[spec/design_output/pull#a-todo-forces-a-place]]
test("a digit past the last row lands at the end", () => {
  const it = box();

  plan({ add: [{ title: "tidy up", place: 9 }] }, it);

  assert.equal(todoOf(it, "tidy up"), "end");
});

// [[spec/design_output/stop#the-plan]]
test("the answer names each new todo with the place it takes in the queue", () => {
  const it = box();

  const said = plan({ add: [{ title: "read the note", place: 2 }] }, it);

  assert.match(said.result.result, /read the note stands at 2\b/);
});

// [[spec/design_output/pull#a-todo-forces-a-place]]
test("two todos at one digit in one call stand in the order the call gives", () => {
  const it = box();

  const said = plan(
    {
      add: [
        { title: "zeta todo", place: 2 },
        { title: "alpha todo", place: 2 },
      ],
    },
    it,
  );

  assert.match(said.result.result, /zeta todo stands at 2\b/);
  assert.match(said.result.result, /alpha todo stands at 3\b/);
});

// A box carrying no process door reads no queue, so a digit past the front lands at the end. [[spec/design_output/stop#the-plan]]
test("a box with no process door reads no queue, and a digit past one lands at the end", () => {
  const it = { ...box(), proc: undefined };

  const said = plan({ add: [{ title: "read the note", place: 2 }] }, it);

  assert.equal(todoOf(it, "read the note"), "end");
  assert.doesNotMatch(said.result.result, /stands at/, "no queue, no place named");
});
