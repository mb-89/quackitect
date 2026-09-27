// branch done, driven through fake doors: the box leaves, and hands its branch back.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#a-box-leaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { fieldOf, recordIn, withEntry, withField } from "../../src/engine/group.js";
import { DONE, work } from "../../src/scripts/work.js";
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
  const took = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box 3f9a",
      hash_before: "a1b2c3",
    },
    fakeFront(),
  );
  const { it, outside, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children", fakeFront()),
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

// A top group hands its open tickets on loose, and names each. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
test("done on a top group hands each open or draft ticket naming it on loose, and names each", () => {
  const took = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box 3f9a",
      hash_before: "a1b2c3",
    },
    fakeFront(),
  );
  const { it, disk, outside } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children", fakeFront()),
    [on("a-child")]: CHILD("one-group", "open"),
    [on("a-draft")]: CHILD("one-group", "draft"),
    [on("shut-one")]: CHILD("one-group", "closed"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, said);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, SHA, "the box leaves");
  assert.equal(fieldOf(now, "state"), "closed");
  for (const one of ["a-child", "a-draft"])
    assert.equal(fieldOf(disk.read(on(one)), "group"), "", `${one} stands loose`);
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
  assert.match(said, /a-child/);
  assert.match(said, /a-draft/);
  assert.doesNotMatch(said, /shut-one/, "a closed ticket counts nowhere");
  assert.ok(ranGit(outside).includes("git add spec/tickets/a-child.md"));
});

test("done hands on a ticket waiting for a helper, and a ticket of another group counts nowhere", () => {
  const took = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box 3f9a",
      hash_before: "a1b2c3",
    },
    fakeFront(),
  );
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children", fakeFront()),
    [on("a-child")]: CHILD("one-group", "open").replace(
      "    does: makes",
      "    by: helper\n    does: makes",
    ),
    [on("elsewhere")]: CHILD("another-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "closed");
  assert.equal(fieldOf(disk.read(on("a-child")), "group"), "");
  assert.equal(fieldOf(disk.read(on("elsewhere")), "group"), "another-group");
  assert.match(said, /a-child/);
  assert.doesNotMatch(said, /elsewhere/, "a ticket of another group counts nowhere");
});

// [[spec/design_output/work#a-box-leaves]]
test("done on a group refuses while the battery answers nothing green", () => {
  const took = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box 3f9a",
      hash_before: "a1b2c3",
    },
    fakeFront(),
  );
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
  const took = withEntry(
    GROUP_NOTE,
    {
      step: "sync",
      hand: "box 3f9a",
      hash_before: "a1b2c3",
    },
    fakeFront(),
  );
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
    fakeFront(),
  ),
  "step",
  "children",
  fakeFront(),
);

const written = (text, ...leaves) =>
  leaves.reduce(
    (now, leaf) =>
      withEntry(
        now,
        {
          step: `retro/${leaf}`,
          hand: "box 3f9a",
          hash_before: "c4d5e6",
          hash_after: "c4d5e6",
        },
        fakeFront(),
      ),
    text,
  );

// [[spec/design_output/work#a-box-leaves]]
test("done refuses while the group's retro stands open, and names the retro step", () => {
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: RETRO_GROUP,
    [on("a-child")]: CHILD("one-group", "closed"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /retro\/notes/);
  assert.match(said, /ticket pull one-group/);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, undefined, "the box stays");
  assert.equal(fieldOf(now, "state"), "open");
  assert.equal(fieldOf(disk.read(on("a-child")), "group"), "one-group");
});

// [[spec/design_output/work#a-box-leaves]]
test("done names the open retro before it hands a ticket on, and hands none of it on", () => {
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: RETRO_GROUP,
    [on("a-child")]: CHILD("one-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /retro\/notes/);
  assert.equal(fieldOf(disk.read(on("a-child")), "group"), "one-group");
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

// A group at children with its hold, and the loose tickets its branch adds. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
function leaving(fix, added) {
  const took = withEntry(
    GROUP_NOTE,
    { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
    fakeFront(),
  );
  const group = withField(took, "step", "children", fakeFront());
  const files = {
    [on("one-group")]: fix
      ? group.replace("state: open\n", "state: open\nfix: true\n")
      : group,
    ...green,
  };
  for (const [name, text] of Object.entries(added)) files[on(name)] = text;
  const listed = Object.keys(added).map((name) => `spec/tickets/${name}.md`);
  return doorsSaying(
    {
      ...onBranch("work/one-group"),
      "git diff --name-only --diff-filter=A origin/main...HEAD -- spec/tickets": {
        stdout: listed.length ? `${listed.join("\n")}\n` : "",
      },
    },
    files,
  );
}

const looseAgent = CHILD("", "open").replace("group: \n", "");
const loosePerson = `---
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

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
test("done on a fix group refuses an agent ticket it leaves, and names the mint of a question ticket for it", () => {
  const { it, disk, outside } = leaving(true, {
    "a-follow-up": looseAgent,
    "b-follow-up": looseAgent,
    "a-question": loosePerson,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.equal(
    fieldOf(disk.read(on("one-group")), "state"),
    "open",
    "the group stays open",
  );
  for (const name of ["a-follow-up", "b-follow-up"]) {
    assert.match(
      said,
      new RegExp(
        `\\./RUNME\\.sh mint ticket spec/tickets/${name}-question\\.md --process=question`,
      ),
    );
    assert.match(
      said,
      new RegExp(`\\./RUNME\\.sh ticket pull ${name} --became ${name}-question`),
    );
  }
  assert.doesNotMatch(said, /a-question/, "a person's ticket stands unnamed");
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git push")),
    "nothing is pushed",
  );
});

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
test("done on a fix group passes where every ticket it leaves waits on a person", () => {
  const { it, disk } = leaving(true, { "a-question": loosePerson });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "closed");
});

// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
test("done on a feature group hands back an open agent ticket it adds, as it does today", () => {
  const { it, disk } = leaving(false, { "a-follow-up": looseAgent });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "closed");
});

// The group leaving names a parent, and the parent stands beside it. [[spec/tickets/groups-hold-groups]]
function nested(doors) {
  const now = doors.disk.read(on("one-group"));
  doors.disk.write(on("one-group"), withField(now, "group", "big-move", fakeFront()));
  doors.disk.write(on("big-move"), GROUP_NOTE);
  return doors;
}

// [[spec/tickets/groups-hold-groups]]
test("branch done files each open child under the parent", () => {
  const { it, disk } = nested(leaving(false, {}));
  disk.write(on("a-child"), CHILD("one-group", "open"));
  disk.write(on("a-draft"), CHILD("one-group", "draft"));
  disk.write(on("shut-one"), CHILD("one-group", "closed"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "closed");
  for (const one of ["a-child", "a-draft"])
    assert.equal(fieldOf(disk.read(on(one)), "group"), "big-move", `${one} moves up`);
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
});

// [[spec/tickets/groups-hold-groups]]
test("branch done files each added loose ticket under the parent", () => {
  const { it, disk } = nested(
    leaving(false, { "a-follow-up": looseAgent, "a-question": loosePerson }),
  );

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, said);
  for (const one of ["a-follow-up", "a-question"])
    assert.equal(
      fieldOf(disk.read(on(one)), "group"),
      "big-move",
      `${one} lands under the parent`,
    );
});

// [[spec/tickets/groups-hold-groups]]
test("a top group leaves them loose", () => {
  const { it, disk } = leaving(false, { "a-follow-up": looseAgent });
  disk.write(on("a-child"), CHILD("one-group", "open"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "state"), "closed");
  for (const one of ["a-child", "a-follow-up"])
    assert.equal(fieldOf(disk.read(on(one)), "group"), "", `${one} stands loose`);
});
