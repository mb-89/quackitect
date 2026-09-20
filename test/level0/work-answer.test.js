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

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the flag writes the queue place, and no flag writes none", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const bare = answerOf(it);
  assert.equal("queue" in bare.loose[0], false, "no flag leaves the place out");
  assert.equal("queue" in bare.branches[0].tickets[0], false);

  const said = answerOf(it, true);
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
