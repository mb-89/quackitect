// The one reading of git. One function reads it, and a flag adds the order.
// [[spec/design_output/work#one-reading-answers-git]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { COL, work } from "../../src/scripts/work.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  heard,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

const LOOSE = CHILD("one-group", "open").replace("group: one-group\n", "");

const doors = (files = {}) => {
  const said = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa", when: 1767225600 }], {
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
    }),
    files,
  );
  said.it.root = ROOT;
  return said;
};

// [[spec/design_output/work#one-reading-answers-git]]
test("the answer names every branch, the tickets on it and the loose ones", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);

  assert.equal(said.branches.length, 1);
  const one = said.branches[0];
  assert.equal(one.branch, "work/one-group");
  assert.equal(one.kind, "group");
  assert.equal(one.status, "todo");
  assert.equal(one.age, "3h");
  assert.deepEqual(
    one.tickets.map((held) => held.name),
    ["a-child"],
  );
  assert.equal(one.tickets[0].state, "open");
  assert.equal(one.tickets[0].step, "do");
  assert.deepEqual(
    said.loose.map((held) => held.name),
    ["a-loose-one"],
  );
});

// The queue rides every answer, so the tab draws each row's place. [[spec/design_output/pull#the-queue-is-a-score]]
test("the answer carries the queue place by default, and a caller turns it off", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const bare = answerOf(it, false);
  assert.equal("queue" in bare.loose[0], false, "a caller asking for none gets none");
  assert.equal("queue" in bare.branches[0].tickets[0], false);

  const said = answerOf(it);
  const places = [
    ...said.branches.map((one) => one.queue),
    ...said.branches.flatMap((one) => one.tickets).map((one) => one.queue),
    ...said.loose.map((one) => one.queue),
  ].sort();
  assert.deepEqual(
    places,
    [1, 2, 3],
    "the group's row takes a place beside its tickets",
  );
});

// A group on trunk with no branch stands in the answer with its kind, and its children beside it, so the tab nests them. [[spec/design_output/tree-view#the-name-column-nests]]
test("the answer carries a group with no branch, its children, and the whole ask", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa", when: 1767225600 }], {
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      "origin/main:spec/tickets/a-loose-group.md": GROUP_NOTE,
      "origin/main:spec/tickets/its-child.md": CHILD("a-loose-group", "open"),
    }),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);

  const names = said.loose.map((one) => `${one.name}:${one.kind}:${one.group}`).sort();
  assert.deepEqual(names, ["a-loose-group:group:", "a-loose-one:ticket:", "its-child:ticket:a-loose-group"]);
  assert.equal(said.loose.find((one) => one.name === "a-loose-group").says, "Two tickets that land as one.");
  assert.equal(said.branches[0].says, "Two tickets that land as one.", "a branch row carries the whole ask too");
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the queue listing pads every place to one width, so the names line up", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const { code, said } = heard(() => work(ROOT, ["list", "", "--queue"], it));

  assert.equal(code, 0);
  const rows = said.split("\n").filter(Boolean);
  assert.equal(rows.length, 3, "one row a thing in the queue");
  for (const row of rows) {
    assert.match(row, /^\s+\d {2}\S/, "the place stands padded, then two spaces");
    assert.equal(row.indexOf("  ", COL.place - 1), COL.place, "one width for all");
  }
});
