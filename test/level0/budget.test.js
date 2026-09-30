// The time budgets: each call a hand makes answers inside the budget the config
// names, over a fixture the size of real work, so a slow call turns the battery
// red before a hand meets it. Each case times the median of several runs.
// [[spec/design_input/level-two#time-budgets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { underBuiltIns } from "../../.claude/skills/level0/lib/config.js";
import file from "../../spec/config/level0.json" with { type: "json" };
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import * as hand from "../../src/scripts/guidance-hand.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, heard, ROOT, standing } from "./pull-doors.js";

const RUNS = 5;
const TICKETS = 80;
const NOTES = 40;
const CALLS = ["pull", "handBack", "resolver", "stale"];

// The median of the runs, so one slow run on a loaded box moves no verdict. [[spec/design_input/level-two#time-budgets]]
function median(run) {
  const took = [];
  for (let i = 0; i < RUNS; i++) {
    const setup = run.setup ? run.setup() : undefined;
    const from = performance.now();
    run.call(setup);
    took.push(performance.now() - from);
  }
  return took.sort((a, b) => a - b)[Math.floor(RUNS / 2)];
}

const said = underBuiltIns(schema, file);

const budgetOf = (call) => {
  const ms = said.budget?.[call];
  assert.equal(typeof ms, "number", `the config names a budget for ${call}`);
  return ms;
};

// A group carrying many children and loose tickets beside it, the size the pull meets in real work. [[spec/design_input/level-two#time-budgets]]
function bigTree() {
  const files = standing();
  for (let i = 0; i < TICKETS; i++) {
    files[at(`spec/tickets/child-${i}.md`)] = CHILD("open", "design/draft");
    files[at(`spec/tickets/loose-${i}.md`)] = CHILD("open", "design/draft").replace(
      "group: one-group\n",
      "",
    );
  }
  return files;
}

const note = (i, front) =>
  `---\nkind: [[guidance]]\nscope: ["a hand"]\n${front}---\n\n# Actionables\n\n1. Rule ${i} says what the hand does.\n`;

// Many notes under many folders, which the resolver and the stale query read and hash. [[spec/design_input/level-two#time-budgets]]
function manyNotes() {
  const files = {};
  for (let i = 0; i < NOTES; i++)
    files[at(`spec/guidance/part-${i % 8}/note-${i}.md`)] = note(
      i,
      `tags: [t${i % 5}]\n`,
    );
  return files;
}

// [[spec/design_input/level-two#time-budgets]]
test("the config names a time budget for the pull, the hand-back, the resolver and the query for stale steps", () => {
  for (const call of CALLS) assert.ok(budgetOf(call) > 0);
});

// [[spec/design_input/level-two#time-budgets]]
test("the pull hands out a leaf inside its budget over a group of many tickets", () => {
  const budget = budgetOf("pull");
  const ms = median({
    setup: () => doors(bigTree()).it,
    call: (it) => assert.equal(heard(() => pulling(ROOT, ["pull"], it)).code, 0),
  });
  assert.ok(
    ms <= budget,
    `the pull takes ${ms.toFixed(1)} ms, and its budget is ${budget} ms`,
  );
});

// [[spec/design_input/level-two#time-budgets]]
test("the hand-back lands inside its budget over a group of many tickets", () => {
  const budget = budgetOf("handBack");
  const fields = JSON.stringify({
    approach: "The approach reads the ask, and names the change.",
  });
  const ms = median({
    setup: () => {
      const { it } = doors(bigTree());
      heard(() => pulling(ROOT, ["pull"], it));
      return it;
    },
    call: (it) =>
      heard(() => pulling(ROOT, ["pull", "a-child", "--pass", "--fields", fields], it)),
  });
  assert.ok(
    ms <= budget,
    `the hand-back takes ${ms.toFixed(1)} ms, and its budget is ${budget} ms`,
  );
});

// [[spec/design_input/level-two#time-budgets]]
test("the resolver answers inside its budget over many notes", () => {
  const budget = budgetOf("resolver");
  assert.equal(typeof hand.resolved, "function", "guidance-hand.js answers resolved");
  const it = { root: ROOT, method: ROOT, join, disk: fakeDisk(manyNotes()) };
  const ms = median({ call: () => hand.resolved(it, ["part-1", "t1"], {}) });
  assert.ok(
    ms <= budget,
    `the resolver takes ${ms.toFixed(1)} ms, and its budget is ${budget} ms`,
  );
});

// The stale query reads and hashes every note a hold names, then compares the hashes. [[spec/design_input/level-two#time-budgets]]
test("the query for stale steps answers inside its budget over a hold of many reads", () => {
  const budget = budgetOf("stale");
  const files = manyNotes();
  const it = { root: ROOT, method: ROOT, join, disk: fakeDisk(files) };
  const paths = Object.keys(files).map((one) =>
    one.slice(ROOT.length + 1).replace(/\.md$/, ""),
  );
  const held = { refused: 0, reads: hand.readsOf(it, paths) };
  const ms = median({ call: () => hand.handsAgain(held, hand.readsOf(it, paths)) });
  assert.ok(
    ms <= budget,
    `the stale query takes ${ms.toFixed(1)} ms, and its budget is ${budget} ms`,
  );
});
