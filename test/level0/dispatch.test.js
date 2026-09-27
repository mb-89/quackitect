// The dispatcher's dry run: the plan it reads off origin/main and the work
// branches, and the nothing it writes.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { withEntry, withField, withHashAfter } from "../../src/engine/group.js";
import { dispatch, planOf } from "../../src/scripts/dispatch.js";
import { freeNow } from "../../src/scripts/work-free.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  heard,
  ranGit,
  remoteSaying,
  ROOT,
} from "./work-doors.js";

const FROM = "2026-01-02T00:00:00.000Z";
const NOW = Math.floor(new Date(FROM).getTime() / 1000);
const HOUR = 3600;

const waitingOn = (name) =>
  GROUP_NOTE.replace("state: open\n", `state: open\ndepends_on: ${name}\n`);
const held = withEntry(
  GROUP_NOTE,
  { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
  fakeFront(),
);
const done = withField(
  withHashAfter(held, "d4e5f6", fakeFront()),
  "state",
  "closed",
  fakeFront(),
);
const loose = CHILD("", "open").replace("group: \n", "");
const forPerson = `---
kind: [[ticket]]
state: open
step: ask
steps:
  - name: ask
    does: asks the owner a question
    by: person
---

# Ask

A question for the owner.

# ask

# Discussion

Nothing yet.
`;

// Each group stands on a branch of its own, and trunk carries the loose tickets. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
function planned(groups, trunk = {}, extra = {}) {
  const refs = groups.map((one) => ({
    branch: `work/${one.name}`,
    tip: `tip-${one.name}`,
    when: one.when ?? NOW,
    merged: one.merged,
  }));
  const objects = Object.fromEntries(
    groups.map((one) => [`work/${one.name}:spec/tickets/${one.name}.md`, one.note]),
  );
  for (const [name, note] of Object.entries(trunk))
    objects[`origin/main:spec/tickets/${name}.md`] = note;
  const doors = doorsSaying({ ...remoteSaying(refs, objects), ...extra });
  doors.it.clock = fakeClock(FROM);
  doors.it.stale = "12h";
  return { ...doors, groups };
}

const names = (rows) => rows.map((one) => one.group).sort();

test("a group whose dependencies stand closed reads ready", () => {
  const { it } = planned([
    { name: "first", note: GROUP_NOTE, merged: true },
    { name: "second", note: waitingOn("first") },
  ]);
  assert.deepEqual(names(planOf(it).ready), ["second"]);
});

test("a group waiting on an open group reads waiting, and not ready", () => {
  const { it } = planned([
    { name: "first", note: GROUP_NOTE },
    { name: "second", note: waitingOn("first") },
  ]);
  const plan = planOf(it);
  assert.deepEqual(names(plan.ready), ["first"]);
  assert.deepEqual(plan.waiting, [{ group: "second", waits: ["first"] }]);
});

test("a hold past work.staleAfter reads ready, and a fresh hold reads held", () => {
  const { it } = planned([
    { name: "left", note: held, when: NOW - 13 * HOUR },
    { name: "worked", note: held, when: NOW - HOUR },
  ]);
  const plan = planOf(it);
  assert.deepEqual(names(plan.ready), ["left"]);
  assert.deepEqual(names(plan.held), ["worked"]);
});

test("the loose agent tickets stand in the bundle, and a ticket for a person under the questions alone", () => {
  const { it } = planned([], {
    "a-loose-one": loose,
    "a-closed-one": CHILD("", "closed").replace("group: \n", ""),
    "a-question": forPerson,
  });
  const plan = planOf(it);
  assert.deepEqual(plan.bundles, [{ parent: "", tickets: ["a-loose-one"] }]);
  assert.deepEqual(plan.questions, [{ ticket: "a-question", group: "" }]);
});

test("a group at done whose branch stands behind origin/main reads as a stuck hand-over", () => {
  const { it } = planned(
    [{ name: "landing", note: done }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "3\n" },
    },
  );
  const plan = planOf(it);
  assert.deepEqual(plan.stuck, [{ group: "landing", why: "behind" }]);
  assert.deepEqual(plan.ready, []);
});

test("a group at done past work.staleAfter reads as a stuck hand-over", () => {
  const { it } = planned(
    [{ name: "landing", note: done, when: NOW - 13 * HOUR }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "0\n" },
    },
  );
  assert.deepEqual(planOf(it).stuck, [{ group: "landing", why: "stale" }]);
});

test("a group at done, up to date and fresh, stands out of the stuck list", () => {
  const { it } = planned(
    [{ name: "landing", note: done, when: NOW - HOUR }],
    {},
    {
      "git rev-list --count origin/work/landing..origin/main": { stdout: "0\n" },
    },
  );
  assert.deepEqual(planOf(it).stuck, []);
});

test("the dry run writes no file, makes no commit and pushes nothing", () => {
  const { it, outside, disk } = planned([{ name: "first", note: GROUP_NOTE }], {
    "a-loose-one": loose,
  });
  const before = [...disk.files.keys()];
  const said = heard(() => dispatch(ROOT, ["--dry"], it));
  assert.equal(said.code, 0);
  assert.match(said.said, /work\/first/);
  assert.deepEqual([...disk.files.keys()], before);
  const writes = ranGit(outside).filter((row) =>
    /^git (commit|push|merge|switch|reset|checkout|add)\b/.test(row),
  );
  assert.deepEqual(writes, []);
});

test("--json prints the plan as one JSON object", () => {
  const { it } = planned([{ name: "first", note: GROUP_NOTE }]);
  const said = heard(() => dispatch(ROOT, ["--dry", "--json"], it));
  assert.equal(said.code, 0);
  assert.match(said.said, /^\{.*\}$/);
  assert.deepEqual(names(JSON.parse(said.said).ready), ["first"]);
});

test("a run without --dry answers 2, since the writes land in a later child", () => {
  const { it } = planned([]);
  assert.equal(heard(() => dispatch(ROOT, [], it)).code, 2);
});

test("freeNow and the plan name the same ready groups", () => {
  const groups = [
    { name: "first", note: GROUP_NOTE },
    { name: "second", note: waitingOn("first") },
    { name: "third", note: GROUP_NOTE },
  ];
  const { it } = planned(groups);
  const free = freeNow(new Map(groups.map((one) => [`work/${one.name}`, one.note])));
  assert.deepEqual(
    planOf(it)
      .ready.map((one) => one.branch)
      .sort(),
    [...free].sort(),
  );
});
