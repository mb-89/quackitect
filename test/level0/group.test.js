// A group read off its ticket, and the writes the verbs make to it. Every
// case here is text in and text out, so a branch reaches none of it.
// [[spec/design_output/work#a-group-is-a-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aged,
  askOf,
  fieldOf,
  firstLeaf,
  heldIn,
  isGroup,
  recordIn,
  spanOf,
  stepOf,
  todoOf,
  ticketAt,
  withEntry,
  withField,
  withHashAfter,
  withoutField,
} from "../../src/engine/group.js";

const NOTE = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
steps:
  - name: sync
    does: takes trunk into the branch
  - name: retro
    steps:
      - name: notes
      - name: write
---

# Ask

What these tickets add up to.

# sync

# retro

## notes

## write

# Discussion

Nothing yet.
`;

// [[spec/design_output/work#a-group-is-a-ticket]]
test("a group is the ticket whose process is group, and no other", () => {
  assert.equal(isGroup(NOTE), true);
  assert.equal(
    isGroup(NOTE.replace("process: [[group]]", "process: [[standard]]")),
    false,
  );
  assert.equal(isGroup(NOTE.replace("process: [[group]]\n", "")), false);
  assert.equal(isGroup(""), false);
  assert.equal(ticketAt("a-group-is-a-branch"), "spec/tickets/a-group-is-a-branch.md");
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("a field reads without its link brackets, and a missing one reads empty", () => {
  assert.equal(fieldOf(NOTE, "state"), "open");
  assert.equal(fieldOf(NOTE, "process"), "group");
  assert.equal(fieldOf(NOTE, "group"), "");
  assert.equal(askOf(NOTE), "What these tickets add up to.");
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("the step of a group with none is the first leaf of its route", () => {
  assert.equal(firstLeaf([{ name: "a" }, { name: "b" }]), "a");
  assert.equal(firstLeaf([{ name: "a", steps: [{ name: "one" }] }]), "a/one");
  assert.equal(firstLeaf([]), "");
  assert.equal(stepOf(NOTE), "sync");
  assert.equal(
    stepOf(NOTE.replace("state: open", "state: open\nstep: retro/write")),
    "retro/write",
  );
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("the take writes one record entry, and a second entry lands under the first", () => {
  const once = withEntry(NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  assert.deepEqual(recordIn(once), [
    { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
  ]);
  assert.match(
    once,
    /^record:\n {2}- step: sync\n {4}hand: box 3f9a\n {4}hash_before: a1b2c3$/m,
  );
  assert.equal(
    askOf(once),
    "What these tickets add up to.",
    "the body stands untouched",
  );

  const twice = withEntry(once, {
    step: "retro/write",
    hand: "box 7c1d",
    hash_before: "d4e5f6",
  });
  assert.deepEqual(
    recordIn(twice).map((one) => one.step),
    ["sync", "retro/write"],
  );
});

// [[spec/design_output/work#held-derives-from-the-record]]
test("a group holds where its newest entry carries hash_before and no hash_after", () => {
  assert.equal(heldIn(NOTE), null, "a group nobody took holds nowhere");

  const took = withEntry(NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  assert.deepEqual(heldIn(took), {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });

  const gave = withHashAfter(took, "d4e5f6");
  assert.equal(heldIn(gave), null, "a box that left holds nothing");
  assert.equal(recordIn(gave).at(-1).hash_after, "d4e5f6");

  const again = withEntry(gave, {
    step: "sync",
    hand: "box 7c1d",
    hash_before: "0a0b0c",
  });
  assert.equal(heldIn(again).hand, "box 7c1d", "the newest entry answers");
});

// [[spec/design_output/work#held-derives-from-the-record]]
test("a hand-back after the take leaves the claim standing, and the release closes that entry", () => {
  const took = withEntry(NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const ran = withEntry(took, {
    step: "split",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
    hash_after: "d4e5f6",
  });

  assert.equal(heldIn(ran).hand, "box 3f9a", "the box holds what it took");
  assert.equal(heldIn(ran).step, "sync", "the claim is the entry the take opens");

  const gave = withHashAfter(ran, "99a888");
  assert.equal(heldIn(gave), null, "the release closes the take");
  assert.equal(recordIn(gave)[0].hash_after, "99a888");
  assert.equal(
    recordIn(gave)[1].hash_after,
    "d4e5f6",
    "the hand-back keeps its own hash",
  );
});

// [[spec/design_output/work#held-derives-from-the-record]]
test("a release closes the row heldIn reads as open, and leaves a skip row without hash_before untouched", () => {
  const took = withEntry(NOTE, {
    step: "sync",
    hand: "box d6f05e3a585030 · claude-code",
    hash_before: "f557e5c56139658231d08fe4af300c90ceea4568",
  });
  const skipped = withEntry(took, {
    step: "sync",
    skipped: true,
    why: "the box runs off the cloud",
  });
  const split = withEntry(skipped, {
    step: "split",
    hand: "box d6f05e3a585030 · claude-code",
    hash_before: "59f5ef62a4da20b6365fb3e30222335890ecfebf",
    hash_after: "abe7834950dc122148a4ef8cbf7dd799963e6b78",
  });

  const gave = withHashAfter(split, "99a888");
  assert.equal(heldIn(gave), null, "the release closes the sync take, not the skip row");
  assert.equal(
    recordIn(gave)[0].hash_after,
    "99a888",
    "the sync take carries the release's hash",
  );
  assert.equal(
    Object.hasOwn(recordIn(gave)[1], "hash_after"),
    false,
    "the skip row stays without hash_after",
  );
});

// [[spec/design_output/work#a-box-leaves]]
test("a second hash_after on one entry replaces the first, and writes no other line", () => {
  const took = withEntry(NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const gave = withHashAfter(withHashAfter(took, "d4e5f6"), "99a888");
  assert.equal(recordIn(gave).length, 1);
  assert.equal(recordIn(gave)[0].hash_after, "99a888");
});

// [[spec/design_output/work#a-box-leaves]]
test("a field writes over the one standing, and a new field lands in the frontmatter", () => {
  const shut = withField(withField(NOTE, "state", "closed"), "reason", "done");
  assert.equal(fieldOf(shut, "state"), "closed");
  assert.equal(fieldOf(shut, "reason"), "done");
  assert.equal(fieldOf(shut, "urgency"), "soon", "the fields beside it stand");
});

// [[spec/design_output/work#the-merge-frees-the-tickets]]
test("a ticket loses its group, and the route under it stands", () => {
  const child = NOTE.replace("process: [[group]]", "group: a-group-is-a-branch");
  assert.equal(fieldOf(child, "group"), "a-group-is-a-branch");

  const loose = withoutField(child, "group");
  assert.equal(fieldOf(loose, "group"), "");
  assert.equal(fieldOf(loose, "urgency"), "soon");
  assert.equal(stepOf(loose), "sync", "the route survives the cut");
  assert.equal(
    withoutField(loose, "group"),
    loose,
    "dropping it twice changes nothing",
  );
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("a span reads minutes, hours and days, and an age says the coarsest of them", () => {
  assert.equal(spanOf("90m"), 5400);
  assert.equal(spanOf("12h"), 43200);
  assert.equal(spanOf("3d"), 259200);
  assert.equal(spanOf("later"), 0);
  assert.equal(aged(600), "10m");
  assert.equal(aged(7200), "2h");
  assert.equal(aged(259200), "3d");
});

// A todo reads as nothing, as first for a bare tag, or as the row the ticket stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
test("a todo reads as nothing, first, or the row it names", () => {
  assert.equal(todoOf({}), "");
  assert.equal(todoOf({ todo: false }), "");
  assert.equal(todoOf({ todo: "false" }), "");
  assert.equal(todoOf({ todo: true }), "first");
  assert.equal(todoOf({ todo: "true" }), "first");
  assert.equal(todoOf({ todo: "a-loose-one" }), "a-loose-one");
  assert.equal(todoOf({ todo: " last " }), "last");
});
