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

// A group whose route carries the retro, standing at its children. [[spec/processes/group.yaml]]
const RETRO_GROUP = withField(
  withEntry(
    GROUP_NOTE.replace(
      "  - name: children\n    by: children\n",
      [
        "  - name: children",
        "    by: children",
        "  - name: retro",
        "    steps:",
        "      - name: notes",
        "        does: decides every private note on the box",
        "      - name: write",
        "        does: writes the retro over the box's own window",
        "      - name: cloud",
        "        does: names what the box lacked, met and leaves for a person",
        "        when: cloud",
        "",
      ].join("\n"),
    ),
    { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
  ),
  "step",
  "children",
);

const written = (text, ...leaves) =>
  leaves.reduce(
    (now, leaf) =>
      withEntry(now, {
        step: `retro/${leaf}`,
        hand: "box 3f9a",
        hash_before: "c4d5e6",
        hash_after: "c4d5e6",
      }),
    text,
  );

// [[spec/design_output/work#a-box-leaves]]
test("done refuses while the group's retro stands open, and names the retro step", () => {
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: RETRO_GROUP,
    [on("a-child")]: CHILD("one-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /retro\/notes/);
  assert.match(said, /ticket pull one-group/);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, undefined, "the box stays");
  assert.equal(fieldOf(now, "state"), "open");
  assert.equal(
    fieldOf(disk.read(on("a-child")), "group"),
    "",
    "the open ticket leaves, so the pull reaches the retro",
  );
});

// [[spec/design_output/work#a-box-leaves]]
test("done on a cloud box refuses while the cloud leaf of the retro stands open", () => {
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: written(RETRO_GROUP, "notes", "write"),
    ...green,
  });
  it.cloud = true;

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /retro\/cloud/);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "open");
});

// [[spec/design_output/work#a-box-leaves]]
test("done hands the group back once the retro leaves that apply here stand written", () => {
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: written(RETRO_GROUP, "notes", "write"),
    [on("shut-one")]: CHILD("one-group", "closed"),
    ...green,
  });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, "the cloud leaf applies on a cloud box alone");
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now)[0].hash_after, SHA, "the take entry closes");
  assert.equal(fieldOf(now, "state"), "closed");
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
});
