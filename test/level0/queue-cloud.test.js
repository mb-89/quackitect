// The queue reads a group's place in the cloud off the marker its ticket
// carries, and reads no branch for it.
// [[spec/tickets/the-queue-reads-the-marker]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { answerOf, cloudsIn } from "../../src/scripts/work-answer.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

const ticket = (name, fields) => ({
  name,
  text: `---\nkind: [[ticket]]\nstate: open\n${fields}---\n\n# Ask\n\nA case.\n`,
});

test("a marked group with no branch reads as the cloud's, and its child with it", () => {
  const said = cloudsIn([
    ticket("far", "cloud: true\n"),
    ticket("far-child", "group: far\n"),
    ticket("near", ""),
  ]);
  assert.deepEqual([...said].sort(), ["far", "far-child"]);
});

test("a group with a branch and no marker reads as the desk's", () => {
  const said = cloudsIn([ticket("near", ""), ticket("near-child", "group: near\n")]);
  assert.deepEqual([...said], []);
});

test("an unmerged branch whose group carries no marker stands on the desk", () => {
  const said = answerOf({
    ...doorsSaying(
      remoteSaying(
        [{ branch: "work/one-group", tip: "aaa", when: 1767225600, merged: false }],
        {
          [`origin/main:${GROUP_AT}`]: GROUP_NOTE,
          "origin/main:spec/tickets/a-child.md": CHILD("one-group", "open"),
          [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
          "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
        },
      ),
    ).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });

  assert.notEqual(said.branches[0].queue, "∞");
});
