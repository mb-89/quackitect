// A group trunk marks for the cloud, read by the queue on a merged branch or none.
// [[spec/design_output/pull#the-queue-is-an-outline]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import { CHILD, doorsSaying, GROUP_NOTE, ROOT, remoteSaying } from "./work-doors.js";

const LOOSE = CHILD("one-group", "open").replace("group: one-group\n", "");

const MARKED = GROUP_NOTE.replace("urgent: true\n", "urgent: true\ncloud: true\n");

const placesOf = (said) =>
  new Map(
    [
      ...said.branches,
      ...said.branches.flatMap((one) => one.tickets),
      ...said.loose,
    ].map((one) => [one.name, one.queue]),
  );

// A group trunk marks for the cloud stands there with its open child, whatever its branch reads. [[spec/tickets/marked-groups-stay-cloud]]
test("a marked group on a merged branch stands on the cloud, and so does its open child", () => {
  const { it } = doorsSaying(
    remoteSaying(
      [{ branch: "work/a-marked-group", tip: "bbb", when: 1767225600, merged: true }],
      {
        "work/a-marked-group:spec/tickets/a-marked-group.md": MARKED,
        "work/a-marked-group:spec/tickets/its-child.md": CHILD(
          "a-marked-group",
          "open",
        ),
        "origin/main:spec/tickets/a-marked-group.md": MARKED,
        "origin/main:spec/tickets/its-child.md": CHILD("a-marked-group", "open"),
        "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      },
    ),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const places = placesOf(answerOf(it));

  assert.equal(
    places.get("a-marked-group"),
    "∞",
    "the marked group stands on the cloud",
  );
  assert.equal(places.get("its-child"), "∞", "and its open child stands there too");
  assert.equal(places.get("a-loose-one"), "1", "the desk's row counts from one");
});

// [[spec/tickets/marked-groups-stay-cloud]]
test("a marked group with no branch stands on the cloud, and so does its open child", () => {
  const { it } = doorsSaying(
    remoteSaying([], {
      "origin/main:spec/tickets/a-marked-group.md": MARKED,
      "origin/main:spec/tickets/its-child.md": CHILD("a-marked-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
    }),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const places = placesOf(answerOf(it));

  assert.equal(
    places.get("a-marked-group"),
    "∞",
    "the marked group stands on the cloud",
  );
  assert.equal(places.get("its-child"), "∞", "and its open child stands there too");
  assert.equal(places.get("a-loose-one"), "1", "the desk's row counts from one");
});
