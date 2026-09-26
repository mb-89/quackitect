// branch done, driven through fake doors: the box leaves, and hands its branch back.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#a-box-leaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf, recordIn, withEntry, withField } from "../../src/engine/group.js";
import { DONE, groupStanding, work } from "../../src/scripts/work.js";
import { freeChildren } from "../../src/scripts/work-merge.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  green,
  heard,
  on,
  onBranch,
  ROOT,
  ranGit,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-merge-frees-the-tickets]]
test("freeChildren takes the group off each open and draft ticket, and stages it", () => {
  const { it, disk, outside } = doorsSaying(
    {},
    {
      [on("a-child")]: CHILD("one-group", "open"),
      [on("a-draft")]: CHILD("one-group", "draft"),
      [on("shut-one")]: CHILD("one-group", "closed"),
    },
  );
  it.root = ROOT;

  const freed = freeChildren(it, "one-group");

  assert.deepEqual(freed.sort(), ["a-child", "a-draft"]);
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
  assert.ok(ranGit(outside).includes("git add spec/tickets/a-draft.md"));
});

// [[spec/design_output/work#a-box-leaves]]
test("done writes hash_after, and closes a group whose every ticket is closed", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, outside, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children"),
    [on("a-child")]: CHILD("one-group", "closed"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, SHA);
  assert.equal(fieldOf(now, "state"), "closed");
  assert.equal(fieldOf(now, "reason"), DONE);
  assert.match(said, /every ticket in it is closed/);
  assert.ok(ranGit(outside).includes("git push origin work/one-group"));
});

// [[spec/design_output/work#a-box-leaves]]
// [[spec/design_output/pull#done-leaves-no-takeable-step]]
test("done hands back a group whose ticket a hand can take, and frees that ticket", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk, outside } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children"),
    [on("a-child")]: CHILD("one-group", "open"),
    [on("a-draft")]: CHILD("one-group", "draft"),
    [on("shut-one")]: CHILD("one-group", "closed"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, SHA);
  assert.equal(groupStanding(now), DONE, "branch merge can take it");
  assert.equal(fieldOf(disk.read(on("a-child")), "group"), "");
  assert.equal(fieldOf(disk.read(on("a-draft")), "group"), "");
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
  assert.match(said, /a-draft leaves the group/);
  assert.ok(ranGit(outside).includes("git push origin work/one-group"));
});

test("done closes a group where a ticket in it waits for a helper, and frees only that one", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children"),
    [on("a-child")]: CHILD("one-group", "open").replace(
      "    does: makes",
      "    by: helper\n    does: makes",
    ),
    [on("elsewhere")]: CHILD("another-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, SHA, "the box leaves either way");
  assert.equal(fieldOf(now, "state"), "closed");
  assert.match(said, /a-child leaves the group/);
  assert.doesNotMatch(said, /elsewhere/, "a ticket of another group counts nowhere");
});

// [[spec/design_output/work#a-box-leaves]]
test("done on a group refuses while the battery answers nothing green", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: took,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /no check has run here/);
  assert.equal(recordIn(disk.read(on("one-group"))).at(-1).hash_after, undefined);
});

// [[spec/design_output/work#trunk-comes-in-last-too]]
test("done on a group refuses where trunk stands ahead of it, and names the sync", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk } = doorsSaying(
    {
      ...onBranch("work/one-group"),
      "git rev-list --count HEAD..origin/main": { stdout: "3\n" },
    },
    { [on("one-group")]: took, ...green },
  );

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /main holds 3 commit\(s\) work\/one-group lacks/);
  assert.match(said, /branch sync/);
  assert.equal(
    recordIn(disk.read(on("one-group"))).at(-1).hash_after,
    undefined,
    "the record stands where the sync is owed",
  );
});
