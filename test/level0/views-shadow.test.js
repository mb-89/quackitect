// The sidebar's shadow compare, over plain rows: the old groups on one side,
// the base files and the catalog on the other.
// [[spec/tickets/the-sidebar-shadow-compares]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { apartOf } from "../../src/extension/lib/views-shadow.js";

const HELP = "Take the ticket waiting on you first, and open it.";

function groupsOf(cells) {
  return [{ name: "work", rows: [{ cells }] }];
}

const BASES = [
  {
    name: "work",
    said: {
      badge: "work/open-tasks",
      actions: [{ button: "pull", calls: "work/pull" }],
    },
  },
];

function catalogOf({ value = 3, icon = "📥" } = {}) {
  return {
    "index/names": [{ name: "work/open-tasks", label: "work", looks: "count", value }],
    "index/actions": [
      { name: "work/pull", label: "Pull for me", doc: HELP, icon, fields: [] },
    ],
  };
}

const EDITOR = {
  key: "work.editor",
  counts: './RUNME.sh index call value {"name":"work/open-tasks"}',
  count: 3,
};
const PULL = { key: "work.pull", help: HELP, icon: "📥" };

test("a badge the two paths count apart reads as one line", () => {
  const lines = apartOf(groupsOf([{ ...EDITOR, count: 2 }, PULL]), BASES, catalogOf());
  assert.equal(lines.length, 1);
  assert.match(lines[0], /work\/open-tasks/);
  assert.match(lines[0], /2/);
  assert.match(lines[0], /3/);
});

test("a button whose icon reads apart reads as one line, naming the action", () => {
  const lines = apartOf(groupsOf([EDITOR, PULL]), BASES, catalogOf({ icon: "📤" }));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /work\/pull/);
});

test("pairs that agree read no line", () => {
  assert.deepEqual(apartOf(groupsOf([EDITOR, PULL]), BASES, catalogOf()), []);
});

// [[spec/tickets/the-sidebar-reads-v1]]
test("a badge pairs with no cell whose counts line names another value", () => {
  const other = { ...EDITOR, counts: '{"name":"work/rows"}', count: 2 };
  assert.deepEqual(apartOf(groupsOf([other, PULL]), BASES, catalogOf()), []);
});
