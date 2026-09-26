// Work branches, driven through fake doors: a group, its take, its merge and its close.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import {
  fieldOf,
  heldIn,
  recordIn,
  withEntry,
  withField,
  withHashAfter,
} from "../../src/engine/group.js";
import { probeOf, startOf } from "../../src/scripts/serve.js";
import * as works from "../../src/scripts/work.js";
import {
  DONE,
  groupStanding,
  HELD,
  pulling,
  TODO,
  whyOf,
  work,
} from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  merging,
  on,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-take-writes-the-record]]
test("take claims a group by writing the hand and hash_before into its record, and pushing", () => {
  const { it, outside, disk } = doorsSaying(groupRemote(), {
    [on("one-group")]: GROUP_NOTE,
    ...HAND,
  });

  const { code, said } = heard(() =>
    work(ROOT, ["take"], { ...it, agent: true, cloud: true }),
  );

  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git switch work/one-group"));
  assert.ok(ranGit(outside).includes(`git add ${GROUP_AT}`));
  assert.ok(ranGit(outside).includes("git push origin work/one-group"));

  const held = heldIn(disk.read(on("one-group")));
  assert.deepEqual(held, { step: "sync", hand: "box d462e994b4cef", hash_before: SHA });
  assert.match(said, /Two tickets that land as one/);
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("a pull on trunk takes a group for a cloud box, the way branch take does", () => {
  const { it, outside, disk } = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  for (const [argv, code] of [
    [probeOf("node", 6510), 1],
    [startOf(ROOT), 0],
  ])
    outside.proc.teach(argv, { exitCode: code });
  const { code, said } = heard(() =>
    pulling(ROOT, ["pull"], { ...it, cloud: true, agent: true }),
  );
  assert.equal(code, 0);
  assert.match(
    said,
    /The server starts detached/,
    "a cloud take starts the server where nothing answers",
  );
  assert.ok(
    ranGit(outside).includes("git switch work/one-group") &&
      ranGit(outside).includes("git push origin work/one-group"),
    "the pull takes the group and pushes it",
  );
  assert.equal(heldIn(disk.read(on("one-group"))).hand, "box d462e994b4cef");
  assert.match(said, /Two tickets that land as one/);
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("a desk's pull on trunk leaves every group to the cloud, a marked one and an unmarked one alike", () => {
  const soon = GROUP_NOTE.replace("urgent: true\n", "");
  for (const note of [GROUP_NOTE, soon]) {
    const desk = doorsSaying(
      { ...groupRemote(note), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
      { [on("one-group")]: note, ...HAND },
    );
    const left = heard(() => pulling(ROOT, ["pull"], { ...desk.it, cloud: false }));
    assert.equal(left.code, 0, left.said);
    assert.ok(
      !ranGit(desk.outside).some((one) => one.startsWith("git switch")),
      "the group stays with the cloud",
    );
    assert.ok(
      !ranGit(desk.outside).some((one) => one.startsWith("git branch work/")),
      "its branch stands already",
    );
  }
});

// A take runs on a cloud box alone, and a person's step stands open to it, so a need the box lacks parks the child. [[spec/tickets/the-group-leaves-at-todo]]
test("take leaves a group whose open children no hand on this box can take at todo, and writes no line", () => {
  const parked = CHILD("one-group", "open").replace(
    "    does: makes the change the ask names\n",
    '    does: makes the change the ask names\n    needs: ["nowhere here"]\n',
  );
  const { it, outside } = doorsSaying(groupRemote(), {
    [on("one-group")]: withField(GROUP_NOTE, "step", "children"),
    [on("a-child")]: parked,
    ...HAND,
  });

  const { code, said } = heard(() =>
    work(ROOT, ["take"], { ...it, agent: true, cloud: true }),
  );

  assert.equal(code, 0, said);
  assert.match(said, /work\/one-group stays at todo/);
  assert.match(said, /a-child needs nowhere here at do/, "it names the need");
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git commit")),
    "the take writes no line",
  );
  assert.ok(
    !ranGit(outside).includes("git push origin work/one-group"),
    "and pushes nothing, so the group stands at todo",
  );
});

// A child needing a verb this box lacks, and one waiting on it, so no hand here takes either. [[spec/tickets/the-small-faults-land]]
const NEEDS = CHILD("one-group", "open").replace(
  "    does: makes the change the ask names\n",
  '    does: makes the change the ask names\n    needs: ["nowhere here"]\n',
);
const taking = (files) => {
  const { it } = doorsSaying(groupRemote(), {
    [on("one-group")]: withField(GROUP_NOTE, "step", "children"),
    ...files,
    ...HAND,
  });
  return heard(() => work(ROOT, ["take"], { ...it, agent: true, cloud: true }));
};

// [[spec/tickets/the-small-faults-land]]
test("take names the dependency a child waits on", () => {
  const waiting = CHILD("one-group", "open").replace(
    "group: one-group\n",
    "group: one-group\ndepends_on: [b-child]\n",
  );
  const { code, said } = taking({ [on("a-child")]: waiting, [on("b-child")]: NEEDS });
  assert.equal(code, 0, said);
  assert.match(said, /a-child waits for b-child to close/);
  assert.match(said, /b-child needs nowhere here at do/);
});

// [[spec/tickets/the-small-faults-land]]
test("take names a person for a by: person step alone", () => {
  const { code, said } = taking({ [on("a-child")]: NEEDS });
  assert.equal(code, 0, said);
  assert.match(said, /stays at todo, because no hand here takes an open step/);
  assert.doesNotMatch(said, /person/, "a step no person holds names none");

  assert.equal(typeof works.waitsAt, "function", "work.js answers waitsAt");
  const person = CHILD("one-group", "open").replace(
    "    does: makes the change the ask names\n",
    "    does: makes the change the ask names\n    by: person\n",
  );
  const { it } = doorsSaying(groupRemote(), HAND);
  const desk = { ...it, agent: true, cloud: false };
  assert.equal(
    works.waitsAt(desk, { name: "a-child", text: person }, []),
    "a-child waits for a person at do",
  );
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("branch take with a name takes that branch alone, and refuses a name nobody frees", () => {
  const { it, outside } = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const { code } = heard(() =>
    work(ROOT, ["take", "one-group"], { ...it, cloud: true }),
  );
  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git switch work/one-group"));

  const other = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const refused = heard(() =>
    work(ROOT, ["take", "nope"], { ...other.it, cloud: true }),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.said, /work\/nope stands at no free todo/);
  assert.ok(!ranGit(other.outside).some((one) => one.startsWith("git switch")));
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take meeting a rejected push names both roads, and claims no race", () => {
  const { it, outside } = doorsSaying(
    { ...groupRemote(), "git push origin work/one-group": { exitCode: 1 } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], { ...it, cloud: true }));

  assert.equal(code, 1);
  assert.match(said, /The push of work\/one-group came back refused/);
  assert.match(said, /Somebody taking it first is one road/);
  assert.match(said, /a push door turning it away is another/);
  const ran = ranGit(outside);
  assert.ok(
    ran.lastIndexOf("git reset --keep origin/work/one-group") >
      ran.indexOf("git push origin work/one-group"),
    "the refused claim leaves the branch, keeps the parked files, and the next take meets no commit origin lacks",
  );
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take whose claim will not commit stops, and puts the ticket back", () => {
  const { it, outside } = doorsSaying(
    {
      ...groupRemote(),
      "git commit -m work/one-group: person takes it": {
        exitCode: 1,
        stderr: "the hook refuses",
      },
    },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], { ...it, cloud: true }));

  assert.equal(code, 1, said);
  assert.match(said, /would not commit, so the take stands undone/);
  assert.equal(
    it.disk.read(on("one-group")),
    GROUP_NOTE,
    "the ticket stands as it stood",
  );
  assert.ok(
    !ranGit(outside).includes("git push origin work/one-group"),
    "and nothing pushes",
  );
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take whose sync conflicts after the claim still hands the box its ask", () => {
  const { it } = doorsSaying(
    {
      ...groupRemote(),
      "git rev-list --count HEAD..origin/main": { stdout: "2\n" },
      "git merge origin/main --no-edit -m work/one-group: take main in": {
        exitCode: 1,
      },
    },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() =>
    work(ROOT, ["take"], { ...it, agent: true, cloud: true }),
  );

  assert.equal(code, 1, said);
  assert.match(said, /Resolve the conflict on work\/one-group and commit it/);
  assert.match(said, /You are on work\/one-group, and box d462e994b4cef holds it/);
  assert.match(
    said,
    /Two tickets that land as one/,
    "the ask stands under the conflict",
  );
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take on a box holding its branch hands the ask again, and claims nothing new", () => {
  const held = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box d462e994b4cef",
    hash_before: SHA,
  });
  for (const argv of [["take"], ["take", "another-group"]]) {
    const { it, outside } = doorsSaying(groupRemote(held), {
      [on("one-group")]: held,
      ...HAND,
    });

    const { code, said } = heard(() =>
      work(ROOT, argv, { ...it, agent: true, cloud: true }),
    );

    assert.equal(code, 0, said);
    assert.match(said, /You already hold work\/one-group/);
    assert.match(said, /Two tickets that land as one/, "the ask comes again");
    assert.ok(
      !ranGit(outside).some(
        (one) => one.startsWith("git switch") || one.startsWith("git commit"),
      ),
      "the box stays where it stands and writes no second claim",
    );
    if (argv[1]) assert.match(said, /one branch a session/);
  }
});

// [[spec/design_output/work#held-derives-from-the-record]]
test("a group holds where the record says so, and stands free where it says nothing", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });

  assert.equal(groupStanding(GROUP_NOTE), TODO);
  assert.equal(groupStanding(took), HELD);
  assert.equal(groupStanding(withHashAfter(took, "d4e5f6")), TODO);
  assert.equal(groupStanding(withField(took, "state", "closed")), DONE);
  assert.equal(groupStanding(""), "");
});

// [[spec/design_output/work#a-row-per-group]]
test("list names a group and a loose ticket, each on its own row", () => {
  const loose = CHILD("one-group", "open").replace("group: one-group\n", "");
  const { it } = doorsSaying(
    groupRemote(
      withEntry(GROUP_NOTE, { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" }),
      {
        when: 1767225600,
        objects: {
          "origin/main:spec/tickets/a-loose-one.md": loose,
          "origin/main:spec/tickets/one-group.md": GROUP_NOTE,
        },
      },
    ),
  );
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+held\s+urgent\s+3h/);
  assert.match(said, /a-loose-one\s+ticket\s+open/);
  assert.doesNotMatch(said, /^one-group\s+ticket/m, "a group is no loose ticket");
});

// [[spec/design_output/work#a-ticket-under-its-group]]
test("a group row carries a row per ticket naming it, off the branch tip", () => {
  const { it } = doorsSaying(
    groupRemote(GROUP_NOTE, {
      objects: {
        "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open").replace(
          "group: one-group",
          "group: one-group\nstep: do",
        ),
        "work/one-group:spec/tickets/other-work.md": CHILD("another-group", "open"),
      },
    }),
  );

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+todo/);
  assert.match(said, /^ {2}a-child\s+ticket\s+open\s+do$/m);
  assert.doesNotMatch(
    said,
    /other-work/,
    "a ticket naming another group stays off this row",
  );
  assert.doesNotMatch(
    said,
    /^ {2}one-group\s+ticket/m,
    "the group itself is no child of itself",
  );
});

// [[spec/design_output/work#a-ticket-under-its-group]]
test("a branch carrying no group names no ticket, and a child with no step says its mark", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/no-group", tip: "aaa" }], {
      "work/no-group:spec/tickets/a-child.md": CHILD("no-group", "open"),
    }),
  );

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.match(said, /work\/no-group\s+no status/);
  assert.doesNotMatch(said, /a-child/, "a branch carrying no group names no tickets");
  assert.equal(
    whyOf(CHILD("one-group", "open")),
    "do",
    "a ticket says the step it stands at",
  );
  assert.equal(
    whyOf(CHILD("one-group", "open").replace(/steps:[\s\S]*?\n---/, "---")),
    "",
    "a ticket naming no step and carrying no mark says nothing",
  );
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("a group held past staleAfter stands under yours, with its three answers", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const doors = (stale) => {
    const said = doorsSaying(groupRemote(took, { when: 1767225600 }));
    said.it.clock = fakeClock("2026-01-01T03:00:00.000Z");
    said.it.stale = stale;
    return said.it;
  };

  const quiet = heard(() => work(ROOT, ["list"], doors("12h"))).said;
  assert.doesNotMatch(quiet, /Yours/, "a tip younger than the span asks nothing");

  const asking = heard(() => work(ROOT, ["list"], doors("90m"))).said;
  assert.match(asking, /Yours/);
  assert.match(asking, /one-group held 3h\. Release it, take it over, or close it\./);
});

// [[spec/design_output/work#the-merge-lands-the-truth]]
test("merge runs the check on the merge commit, and undoes the merge on red", () => {
  const red = {
    [`node ${join(ROOT, "src/scripts/cli.js")} check`]: {
      exitCode: 1,
      stdout: "two tests fail\n",
    },
  };
  const { it, outside } = doorsSaying(merging(red));
  it.node = "node";

  const { code, said } = heard(() => work(ROOT, ["merge", "one-group"], it));

  assert.equal(code, 1);
  assert.match(said, /answers red on the merge commit/);
  assert.match(said, /two tests fail/);
  assert.ok(
    ranGit(outside).includes(`git reset --hard ${SHA}`),
    "trunk stands where it was",
  );
});

// [[spec/design_output/work#the-merge-lands-the-truth]]
test("merge refuses where trunk moved a ticket the branch holds, and names the lines", () => {
  const moved = {
    [`git diff --unified=0 base111..origin/main -- ${GROUP_AT}`]: {
      stdout: "--- a/x\n+++ b/x\n@@ -3 +3 @@\n-urgency: now\n+urgency: whenever\n",
    },
  };
  const { it, outside } = doorsSaying(merging(moved));
  it.node = "node";

  const { code, said } = heard(() => work(ROOT, ["merge", "one-group"], it));

  assert.equal(code, 1);
  assert.match(said, /main moved what work\/one-group holds/);
  assert.match(said, /-urgency: now/);
  assert.match(said, /\+urgency: whenever/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git merge --no-ff")));
});

// [[spec/design_output/work#the-merge-frees-the-tickets]]
test("merge frees an open ticket of the group it takes in, and leaves a closed one", () => {
  const { it, outside, disk } = doorsSaying(merging(), {
    [on("a-child")]: CHILD("one-group", "open"),
    [on("shut-one")]: CHILD("one-group", "closed"),
  });
  it.node = "node";

  const { code, said } = heard(() => work(ROOT, ["merge", "one-group"], it));

  assert.equal(code, 0);
  assert.equal(fieldOf(disk.read(on("a-child")), "group"), "");
  assert.equal(fieldOf(disk.read(on("shut-one")), "group"), "one-group");
  assert.match(said, /a-child lost its group/);
  assert.ok(ranGit(outside).includes("git commit --amend --no-edit"));
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("release writes hash_after onto a held group, and frees it for anybody", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, outside, disk } = doorsSaying(groupRemote(took), {
    [on("one-group")]: took,
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 0);
  assert.equal(recordIn(disk.read(on("one-group"))).at(-1).hash_after, SHA);
  assert.equal(groupStanding(disk.read(on("one-group"))), TODO);
  assert.match(said, /free for anybody/);
  assert.ok(ranGit(outside).includes("git push origin work/one-group"));
});

// [[spec/design_output/work#a-stale-group-is-yours]]
test("release on a group nobody holds writes nothing, and says so", () => {
  const { it, outside } = doorsSaying(groupRemote(), { [on("one-group")]: GROUP_NOTE });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 0);
  assert.match(said, /holds nobody already/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git commit")));
});

// [[spec/design_output/work#a-merged-branch-closes]]
test("close drops a group's branch once trunk holds it", () => {
  const { it, outside } = doorsSaying({
    "git rev-list --count origin/main..main": { stdout: "0\n" },
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/work/one-group\n",
    },
  });

  const { code } = heard(() => work(ROOT, ["close", "one-group"], it));

  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git push origin --delete work/one-group"));
});
