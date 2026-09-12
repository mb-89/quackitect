// A group read off its ticket, and the three writes the verbs make to it. Every
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
  routeOf,
  spanOf,
  stepOf,
  ticketAt,
  withEntry,
  withField,
  withGave,
  withoutField,
} from "../../src/scripts/group.js";

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
  const once = withEntry(NOTE, { step: "sync", hand: "box 3f9a", took: "a1b2c3" });
  assert.deepEqual(recordIn(once), [
    { step: "sync", hand: "box 3f9a", took: "a1b2c3" },
  ]);
  assert.match(
    once,
    /^record:\n {2}- step: sync\n {4}hand: box 3f9a\n {4}took: a1b2c3$/m,
  );
  assert.equal(
    askOf(once),
    "What these tickets add up to.",
    "the body stands untouched",
  );

  const twice = withEntry(once, {
    step: "retro/write",
    hand: "box 7c1d",
    took: "d4e5f6",
  });
  assert.deepEqual(
    recordIn(twice).map((one) => one.step),
    ["sync", "retro/write"],
  );
});

// [[spec/design_output/work#held-derives-from-the-record]]
test("a group holds where its newest entry carries took and no gave", () => {
  assert.equal(heldIn(NOTE), null, "a group nobody took holds nowhere");

  const took = withEntry(NOTE, { step: "sync", hand: "box 3f9a", took: "a1b2c3" });
  assert.deepEqual(heldIn(took), { step: "sync", hand: "box 3f9a", took: "a1b2c3" });

  const gave = withGave(took, "d4e5f6");
  assert.equal(heldIn(gave), null, "a box that left holds nothing");
  assert.equal(recordIn(gave).at(-1).gave, "d4e5f6");

  const again = withEntry(gave, { step: "sync", hand: "box 7c1d", took: "0a0b0c" });
  assert.equal(heldIn(again).hand, "box 7c1d", "the newest entry answers");
});

// [[spec/design_output/work#a-box-leaves]]
test("a second gave on one entry replaces the first, and writes no other line", () => {
  const took = withEntry(NOTE, { step: "sync", hand: "box 3f9a", took: "a1b2c3" });
  const gave = withGave(withGave(took, "d4e5f6"), "99a888");
  assert.equal(recordIn(gave).length, 1);
  assert.equal(recordIn(gave)[0].gave, "99a888");
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

// [[spec/design_output/work#a-brief-becomes-a-group]]
test("a route reads its steps and its ask off the process file", () => {
  const said = routeOf("name: group\nask:\n  - name: goal\nsteps:\n  - name: sync\n");
  assert.deepEqual(said.steps, [{ name: "sync" }]);
  assert.deepEqual(said.ask, [{ name: "goal" }]);
  assert.deepEqual(routeOf("").steps, []);
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
