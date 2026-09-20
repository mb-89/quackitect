// Work branches, driven through fake doors: a branch and the verbs over it.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { CLOSED, recordIn, urgent, withEntry, withField } from "../../src/engine/group.js";
import {
  changedIn,
  DONE,
  dependsOn,
  HELD,
  MERGED,
  MINE,
  TODO,
  waitingOn,
  work,
} from "../../src/scripts/work.js";
import {
  doorsSaying,
  green,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  on,
  onBranch,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-mark-and-what-waits]]
test("the mark reads from the frontmatter, and a note carrying none reads unmarked", () => {
  assert.equal(urgent("---\nstatus: todo\nurgent: true\n---\n"), true);
  assert.equal(urgent("---\nstatus: todo\nurgent: false\n---\n"), false);
  assert.equal(urgent("---\nstatus: todo\n---\n"), false);
});

test("a dependency reads as a list or on one line, with the prefix dropped", () => {
  const block = "---\ndepends_on:\n  - one\n  - work/two\n---\n";
  assert.deepEqual(dependsOn(block), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: a, work/b\n---\n"), ["a", "b"]);
  assert.deepEqual(dependsOn("---\nstatus: todo\n---\n"), []);
});

// [[spec/design_output/work#the-mark-and-what-waits]]
test("a dependency in a flow list reads without its brackets or its quotes", () => {
  assert.deepEqual(dependsOn("---\ndepends_on: [one, work/two]\n---\n"), [
    "one",
    "two",
  ]);
  assert.deepEqual(dependsOn("---\ndepends_on: [\"one\", 'two']\n---\n"), [
    "one",
    "two",
  ]);
  assert.deepEqual(dependsOn("---\ndepends_on: []\n---\n"), []);
  assert.deepEqual(dependsOn('---\ndepends_on:\n  - "one"\n---\n'), ["one"]);
});

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
test("a branch waits for a dependency until trunk holds it", () => {
  const ticket =
    "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
    ["work/merged", MERGED],
  ]);
  assert.deepEqual(waitingOn(ticket, standing), ["open", "busy", "ready"]);
});

// [[spec/design_output/work#the-mark-and-what-waits]]
test("the mark orders a marked note over an unmarked one", () => {
  const marked = "---\nstatus: todo\nurgent: true\n---\n";
  const bare = "---\nstatus: todo\n---\n";
  const order = [bare, marked].sort((a, b) => Number(urgent(b)) - Number(urgent(a)));
  assert.deepEqual(order, [marked, bare]);
});

test("close reaches a work branch and a branch the platform cut", () => {
  assert.ok(MINE.test("work/fix-lsp"));
  assert.ok(MINE.test("claude/gracious-hawking-zepc6h"));
  assert.ok(!MINE.test("main"));
  assert.ok(!MINE.test("v4"));
  assert.ok(!MINE.test("se/claims"));
});

test("done says one line to the log, naming the branch and the code", async () => {
  const took = withEntry(GROUP_NOTE, {
    step: "sync",
    hand: "box 3f9a",
    hash_before: "a1b2c3",
  });
  const { it, disk } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: withField(took, "state", CLOSED),
    ...green,
  });
  it.log = fakeLog(fakeClock(), { folder: "/log", id: "a6f8c43b" });

  const code = await heard(() => work(ROOT, ["done"], it)).code;

  assert.equal(code, 0);
  assert.equal(recordIn(disk.read(on("one-group"))).at(-1).hash_after, SHA);
  assert.deepEqual(it.log.lines(), [
    {
      at: "2026-01-01T00:00:00.000Z",
      level: "info",
      kind: "work",
      said: "done answered 0",
      branch: "work/one-group",
    },
  ]);
});

test("done off a work branch refuses, and reaches git no further", () => {
  const { it, outside } = doorsSaying(onBranch("main"), {
    [on("one-group")]: GROUP_NOTE,
  });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /branch done runs on a work branch/);
  assert.deepEqual(ranGit(outside), ["git rev-parse --abbrev-ref HEAD"]);
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("done with no group on the tree refuses, because the group is what comes back", () => {
  const { it } = doorsSaying(onBranch("work/fix-lsp"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /carries no spec\/tickets\/fix-lsp\.md/);
});

test("take stops on a tree carrying uncommitted work", () => {
  const { it, outside } = doorsSaying({
    "git status --porcelain": { stdout: " M a.md" },
  });

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 2);
  assert.match(said, /uncommitted changes/);
  assert.deepEqual(ranGit(outside), ["git status --porcelain"]);
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
const parked = `---\nkind: [[ticket]]\nstate: open\nurgency: whenever\ntodo: true\n---\n\n# Ask\n\nLook at the lint.\n\n# Discussion\n\nNothing yet.\n`;
const PARKED_AT = join(ROOT, "spec", "tickets", "slow-lint.md");

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("a porcelain row names its file, with the status gone and a rename at its end", () => {
  assert.equal(changedIn(" M spec/tickets/slow-lint.md"), "spec/tickets/slow-lint.md");
  assert.equal(changedIn("M spec/tickets/slow-lint.md"), "spec/tickets/slow-lint.md");
  assert.equal(changedIn("?? .se/tickets/slow-lint.md"), ".se/tickets/slow-lint.md");
  assert.equal(changedIn("R  old.md -> new.md"), "new.md");
  assert.equal(changedIn('A  "spec/one two.md"'), "spec/one two.md");
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("the uncommitted check looks past a tagged ticket, and take carries on", () => {
  const { it, outside } = doorsSaying(
    {
      "git status --porcelain": { stdout: " M spec/tickets/slow-lint.md" },
      ...groupRemote(),
    },
    { [on("one-group")]: GROUP_NOTE, [PARKED_AT]: parked, ...HAND },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.doesNotMatch(said, /uncommitted changes/);
  assert.ok(ranGit(outside).includes("git switch work/one-group"));
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("take puts every tagged file back, so the reset leaves the tag standing", () => {
  const { it, outside, disk } = doorsSaying(
    {
      "git status --porcelain": { stdout: " M spec/tickets/slow-lint.md" },
      ...groupRemote(),
    },
    { [on("one-group")]: GROUP_NOTE, [PARKED_AT]: parked, ...HAND },
  );

  heard(() => work(ROOT, ["take"], it));

  const ran = ranGit(outside);
  assert.ok(ran.includes("git checkout -- spec/tickets/slow-lint.md"));
  assert.ok(
    ran.indexOf("git checkout -- spec/tickets/slow-lint.md") <
      ran.indexOf("git reset --hard origin/work/one-group"),
    "the save stands before the reset",
  );
  assert.equal(disk.read(PARKED_AT), parked, "the tag comes back after the reset");
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("an untagged change still stops a take, and the tagged one beside it changes nothing", () => {
  const { it, outside } = doorsSaying(
    {
      "git status --porcelain": {
        stdout: " M spec/tickets/slow-lint.md\n M src/scripts/work.js",
      },
    },
    { [PARKED_AT]: parked },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 2);
  assert.match(said, /uncommitted changes/);
  assert.deepEqual(ranGit(outside), ["git status --porcelain"]);
});

// A branch move resets onto origin, so a commit origin lacks dies under it. [[spec/design_output/work#a-branch-moves-clean]]
test("release refuses where the branch holds a commit origin lacks", () => {
  const { it, outside, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
    [`git show origin/work/one-group:${GROUP_AT}`]: { stdout: GROUP_NOTE },
    "git rev-list --count origin/work/one-group..work/one-group": { stdout: "2\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 2);
  assert.match(said, /holds 2 commit\(s\) origin lacks/);
  assert.match(said, /git push origin work\/one-group/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git reset --hard")),
    "the reset that drops them runs nowhere",
  );
  assert.equal(
    disk.exists(on("one-group")),
    false,
    "the group on the tree stays untouched",
  );
});

// [[spec/design_output/work#a-branch-moves-clean]]
test("take refuses where this box stands ahead of origin", () => {
  const { it, outside } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git rev-list --count origin/work/fix-lsp..work/fix-lsp": { stdout: "1\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 2);
  assert.match(said, /holds 1 commit\(s\) origin lacks/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git reset --hard")),
    "the reset that drops it runs nowhere",
  );
});

// The take resets the branch it lands on, so it reads that one too. [[spec/design_output/work#a-branch-moves-clean]]
test("take refuses where the branch it picks holds a commit origin lacks", () => {
  const { it, outside } = doorsSaying(
    {
      ...remoteSaying([{ branch: "work/one-group", tip: "aaa" }], {
        [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      }),
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      "git rev-list --count origin/work/one-group..work/one-group": { stdout: "3\n" },
    },
    { [on("one-group")]: GROUP_NOTE },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 2);
  assert.match(said, /work\/one-group holds 3 commit\(s\) origin lacks/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git reset --hard")),
    "the reset that drops them runs nowhere",
  );
});

// [[spec/design_output/work#a-branch-moves-clean]]
test("a branch level with origin moves as before", () => {
  const { it } = doorsSaying(
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
      [`git show origin/work/one-group:${GROUP_AT}`]: { stdout: GROUP_NOTE },
      "git rev-list --count origin/work/one-group..work/one-group": { stdout: "0\n" },
    },
    { [on("one-group")]: GROUP_NOTE },
  );

  assert.equal(heard(() => work(ROOT, ["release"], it)).code, 0);
});

test("release refuses a branch already standing at done", () => {
  const { it, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
    [`git show origin/work/one-group:${GROUP_AT}`]: {
      stdout: withField(GROUP_NOTE, "state", CLOSED),
    },
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 1);
  assert.match(said, /Read it before you reopen it/);
  assert.equal(
    disk.exists(on("one-group")),
    false,
    "the group on the tree stays untouched",
  );
});

test("close refuses a branch outside trunk, and deletes one inside it", () => {
  const inside = {
    "git rev-list --count origin/main..main": { stdout: "0\n" },
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/work/landed\n",
    },
  };

  const shut = doorsSaying(inside);
  const { code } = heard(() => work(ROOT, ["close", "landed"], shut.it));
  assert.equal(code, 0);
  assert.ok(ranGit(shut.outside).includes("git push origin --delete work/landed"));

  const open = doorsSaying(inside);
  const said = heard(() => work(ROOT, ["close", "elsewhere"], open.it)).said;
  assert.match(said, /outside main/);
  assert.ok(!ranGit(open.outside).some((one) => one.includes("--delete")));
});

// [[spec/design_output/work#a-merged-branch-closes]]
test("close takes a name carrying its own prefix", () => {
  const inside = {
    "git rev-list --count origin/main..main": { stdout: "0\n" },
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/claude/roaming-hopper-ab12cd\n",
    },
  };

  const shut = doorsSaying(inside);
  const { code } = heard(() =>
    work(ROOT, ["close", "claude/roaming-hopper-ab12cd"], shut.it),
  );
  assert.equal(code, 0);
  assert.ok(
    ranGit(shut.outside).includes(
      "git push origin --delete claude/roaming-hopper-ab12cd",
    ),
    "it reaches the branch the platform cut",
  );
});

test("close holds a trunk carrying commits origin has never seen", () => {
  const { it, outside } = doorsSaying({
    "git rev-list --count origin/main..main": { stdout: "2\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["close"], it));

  assert.equal(code, 1);
  assert.match(said, /Push main first/);
  assert.ok(!ranGit(outside).some((one) => one.includes("--delete")));
});

// A branch carrying a group ticket is a group. [[spec/design_output/work#a-group-is-a-ticket]]

// The brief left the tree, so every verb reads the group alone. [[spec/tickets/the-brief-verbs-go]]
test("list reads the group on a branch a root handover also stands on", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa" }], {
      "work/one-group:HANDOVER.md": "---\nstatus: held\n---\n",
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
    }),
  );

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+todo\s+urgent/, "the group's own standing");
  assert.doesNotMatch(said, /brief/, "the kind column goes with the brief");
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("read prints the group a branch carries, and refuses a branch carrying none", () => {
  const { it } = doorsSaying({
    [`git show origin/work/one-group:${GROUP_AT}`]: { stdout: GROUP_NOTE },
  });

  const found = heard(() => work(ROOT, ["read", "one-group"], it));
  assert.equal(found.code, 0);
  assert.match(found.said, /Two tickets that land as one/);

  const none = heard(() => work(ROOT, ["read", "fix-lsp"], it));
  assert.equal(none.code, 1);
  assert.match(none.said, /carries no group at spec\/tickets\/fix-lsp\.md/);
});
