// A group trunk marks `cloud: true` stands on the cloud with its tickets,
// whatever its branch reads, so the desk's count leaves them out.
// [[spec/tickets/marked-groups-stand-in-the-cloud]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

const MARKED = GROUP_NOTE.replace("state: open\n", "state: open\ncloud: true\n");
const LOOSE = CHILD("one-group", "open").replace("group: one-group\n", "");

const ON_TRUNK = {
  [`origin/main:${GROUP_AT}`]: MARKED,
  "origin/main:spec/tickets/a-child.md": CHILD("one-group", "open"),
  "origin/main:spec/tickets/a-loose-one.md": LOOSE,
};

const answered = (refs, objects) =>
  answerOf({
    ...doorsSaying(remoteSaying(refs, objects)).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });

test("a marked group on a merged branch and its ticket stand on the cloud", () => {
  const said = answered(
    [{ branch: "work/one-group", tip: "aaa", when: 1767225600, merged: true }],
    {
      ...ON_TRUNK,
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
    },
  );

  assert.equal(said.branches[0].queue, "∞");
  assert.equal(said.branches[0].tickets[0].queue, "∞");
  assert.equal(said.loose.find((one) => one.name === "a-loose-one").queue, "1");
});

test("a marked group with no branch and its ticket stand on the cloud", () => {
  const said = answered([], ON_TRUNK);
  const place = (name) => said.loose.find((one) => one.name === name).queue;

  assert.equal(place("one-group"), "∞");
  assert.equal(place("a-child"), "∞");
  assert.equal(place("a-loose-one"), "1");
});
