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
} from "../../src/scripts/group.js";
import { probeOf, startOf } from "../../src/scripts/serve.js";
import {
  DONE,
  groupStanding,
  HELD,
  TODO,
  whyOf,
  work,
} from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  green,
  groupRemote,
  HAND,
  HERE,
  heard,
  on,
  onBranch,
  ROOT,
  ranGit,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-take-writes-the-record]]
test("take claims a group by writing the hand and hash_before into its record, and pushing", () => {
  const { it, outside, disk } = doorsSaying(groupRemote(), {
    [on("one-group")]: GROUP_NOTE,
    ...HAND,
  });

  const { code, said } = heard(() => work(ROOT, ["take"], { ...it, agent: true }));

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
    work(ROOT, ["pull"], { ...it, cloud: true, agent: true }),
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
test("a desk's pull on trunk takes a group at urgency now, and leaves one at soon to the cloud", () => {
  const urgent = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const took = heard(() => work(ROOT, ["pull"], { ...urgent.it, cloud: false }));
  assert.equal(took.code, 0, took.said);
  assert.ok(
    ranGit(urgent.outside).includes("git switch work/one-group"),
    "urgency now takes the group",
  );

  const soon = GROUP_NOTE.replace("urgency: now", "urgency: soon");
  const calm = doorsSaying(
    { ...groupRemote(soon), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: soon, ...HAND },
  );
  const left = heard(() => work(ROOT, ["pull"], { ...calm.it, cloud: false }));
  assert.equal(left.code, 0, left.said);
  assert.ok(
    !ranGit(calm.outside).includes("git switch work/one-group"),
    "soon stays with the cloud",
  );
  assert.ok(
    !ranGit(calm.outside).some((one) => one.startsWith("git branch work/")),
    "its branch stands already",
  );

  const named = doorsSaying(
    { ...groupRemote(soon), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: soon, ...HAND },
  );
  const asked = heard(() =>
    work(ROOT, ["pull", "one-group"], { ...named.it, cloud: false }),
  );
  assert.equal(asked.code, 0, asked.said);
  assert.ok(
    ranGit(named.outside).includes("git switch work/one-group"),
    "the owner names it, so the desk takes it",
  );
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("branch take with a name takes that branch alone, and refuses a name nobody frees", () => {
  const { it, outside } = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const { code } = heard(() => work(ROOT, ["take", "one-group"], it));
  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git switch work/one-group"));

  const other = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );
  const refused = heard(() => work(ROOT, ["take", "nope"], other.it));
  assert.equal(refused.code, 1);
  assert.match(refused.said, /work\/nope stands at no free todo/);
  assert.ok(!ranGit(other.outside).some((one) => one.startsWith("git switch")));
});

// [[spec/design_output/work#the-take-writes-the-record]]
test("a take meeting a rejected push names both roads, and claims no race", () => {
  const { it } = doorsSaying(
    { ...groupRemote(), "git push origin work/one-group": { exitCode: 1 } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 1);
  assert.match(said, /The push of work\/one-group came back refused/);
  assert.match(said, /Somebody taking it first is one road/);
  assert.match(said, /a push door turning it away is another/);
});

// [[spec/design_output/work#a-brief-drains-first]]
test("take serves a brief before a group, and the group once no brief stands", () => {
  const brief = "---\nstatus: todo\nurgency: whenever\n---\n\n# Do the thing\n";
  const both = {
    ...groupRemote(),
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/a-brief\nbbb\trefs/heads/work/one-group\n",
    },
    "git show origin/work/a-brief:HANDOVER.md": { stdout: brief },
    "git show origin/work/a-brief:spec/tickets/a-brief.md": { exitCode: 1 },
  };

  const first = doorsSaying(both, { [HERE]: brief, ...HAND });
  assert.equal(heard(() => work(ROOT, ["take"], first.it)).code, 0);
  assert.ok(
    ranGit(first.outside).includes("git switch work/a-brief"),
    "the brief goes first, whatever its urgency",
  );

  const held = {
    ...both,
    "git show origin/work/a-brief:HANDOVER.md": { stdout: brief.replace(TODO, HELD) },
  };
  const next = doorsSaying(held, { [on("one-group")]: GROUP_NOTE, ...HAND });
  assert.equal(heard(() => work(ROOT, ["take"], next.it)).code, 0);
  assert.ok(ranGit(next.outside).includes("git switch work/one-group"));
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
test("list names a group, a brief and a loose ticket, each as its own kind", () => {
  const loose = CHILD("one-group", "open").replace("group: one-group\n", "");
  const { it } = doorsSaying({
    ...groupRemote(
      withEntry(GROUP_NOTE, { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" }),
    ),
    "git log -1 --format=%ct origin/work/one-group": { stdout: "1767225600\n" },
    "git ls-tree -r --name-only origin/main spec/tickets/": {
      stdout: "spec/tickets/a-loose-one.md\nspec/tickets/one-group.md\n",
    },
    "git show origin/main:spec/tickets/a-loose-one.md": { stdout: loose },
    "git show origin/main:spec/tickets/one-group.md": { stdout: GROUP_NOTE },
  });
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+group\s+held\s+now\s+3h/);
  assert.match(said, /a-loose-one\s+ticket\s+open\s+soon/);
  assert.doesNotMatch(said, /^one-group\s+ticket/m, "a group is no loose ticket");
});

// [[spec/design_output/work#a-ticket-under-its-group]]
test("a group row carries a row per ticket naming it, off the branch tip", () => {
  const { it } = doorsSaying({
    ...groupRemote(),
    "git ls-tree -r --name-only origin/work/one-group spec/tickets/": {
      stdout:
        "spec/tickets/one-group.md\nspec/tickets/a-child.md\nspec/tickets/other-work.md\n",
    },
    "git show origin/work/one-group:spec/tickets/a-child.md": {
      stdout: CHILD("one-group", "open").replace(
        "urgency: soon",
        "urgency: soon\nstep: do",
      ),
    },
    "git show origin/work/one-group:spec/tickets/other-work.md": {
      stdout: CHILD("another-group", "open"),
    },
    "git ls-tree -r --name-only origin/main spec/tickets/": { stdout: "" },
  });

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+group\s+todo/);
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
test("a brief carries no ticket row, and a child naming no step says its urgency", () => {
  const brief = "---\nstatus: todo\nurgency: whenever\n---\n\n# Do the thing\n";
  const { it } = doorsSaying({
    ...groupRemote(),
    "git ls-remote --heads origin work/*": { stdout: "aaa\trefs/heads/work/a-brief\n" },
    "git show origin/work/a-brief:HANDOVER.md": { stdout: brief },
    "git ls-tree -r --name-only origin/work/a-brief spec/tickets/": {
      stdout: "spec/tickets/a-child.md\n",
    },
    "git ls-tree -r --name-only origin/main spec/tickets/": { stdout: "" },
  });

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.match(said, /work\/a-brief\s+brief\s+todo/);
  assert.doesNotMatch(said, /a-child/, "a brief names no tickets");
  assert.equal(
    whyOf(CHILD("one-group", "open")),
    "do",
    "a ticket says the step it stands at",
  );
  assert.equal(
    whyOf(CHILD("one-group", "open").replace(/steps:[\s\S]*?\n---/, "---")),
    "soon",
    "a ticket naming no step falls back to its urgency",
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
    const said = doorsSaying({
      ...groupRemote(took),
      "git log -1 --format=%ct origin/work/one-group": { stdout: "1767225600\n" },
    });
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
test("done refuses while a ticket of the group stands at a step a hand can take", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk, outside } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children"),
    [on("a-child")]: CHILD("one-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 1);
  assert.match(said, /a-child stands at do, and a hand can take it/);
  assert.match(said, /branch pull/);
  assert.equal(recordIn(disk.read(on("one-group"))).at(-1).hash_after, undefined);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git push")));
});

test("done leaves a group open where a ticket in it stands open, and names it", () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "step", "children"),
    [on("a-child")]: CHILD("one-group", "open").replace(
      "    does: makes",
      "    by: person\n    does: makes",
    ),
    [on("elsewhere")]: CHILD("another-group", "open"),
    ...green,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  const now = disk.read(on("one-group"));
  assert.equal(recordIn(now).at(-1).hash_after, SHA, "the box leaves either way");
  assert.equal(fieldOf(now, "state"), "open");
  assert.match(said, /1 ticket\(s\) stand open/);
  assert.match(said, /a-child/);
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

const merging = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  [`git show origin/work/one-group:${GROUP_AT}`]: {
    stdout: withField(
      withHashAfter(
        withEntry(GROUP_NOTE, {
          step: "sync",
          hand: "box 3f9a",
          hash_before: "a1b2c3",
        }),
        "d4e5f6",
      ),
      "state",
      "closed",
    ),
  },
  "git merge-base origin/main origin/work/one-group": { stdout: "base111\n" },
  "git diff --name-only base111..origin/work/one-group -- spec/tickets": {
    stdout: `${GROUP_AT}\n`,
  },
  [`git diff --unified=0 base111..origin/main -- ${GROUP_AT}`]: { stdout: "" },
  "git merge --no-ff --no-edit origin/work/one-group": { exitCode: 0 },
  "git rm --cached -q HANDOVER.md": { exitCode: 1 },
  [`node ${join(ROOT, "src/scripts/cli.js")} check`]: {
    exitCode: 0,
    stdout: "green\n",
  },
  ...extra,
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
