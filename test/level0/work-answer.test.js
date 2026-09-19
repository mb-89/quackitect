// The one answer about git. One verb writes it, a flag adds the order, and a
// reader meeting no file says so.
// [[spec/design_output/work#one-verb-answers-git]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { answer, answerHere, answerOf } from "../../src/scripts/work-answer.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  remoteSaying,
  ROOT,
} from "./work-doors.js";

const ANSWER_AT = join(ROOT, ".se", ".runtime", "work.json");
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

// [[spec/design_output/work#one-verb-answers-git]]
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
  assert.deepEqual(places, [1, 2, 3], "the group's row takes a place beside its tickets");
});

// [[spec/design_output/work#one-verb-answers-git]]
test("the verb writes the file, and a reader meeting none says so", () => {
  const { it, disk } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  assert.match(answerHere(it).why, /stands nowhere/);
  assert.equal(answerHere(it).said, null);

  assert.equal(answer(it, []), 0);
  const read = answerHere(it);
  assert.equal(read.why, "");
  assert.equal(read.said.branches[0].branch, "work/one-group");
  assert.match(disk.read(ANSWER_AT), /^\{/);
});

// [[spec/design_output/work#one-verb-answers-git]]
test("a file no reader parses says so, and hands back nothing", () => {
  const { it } = doors({ [ANSWER_AT]: "{ this is no json" });
  const read = answerHere(it);
  assert.equal(read.said, null);
  assert.match(read.why, /reads as no JSON/);
});
