// Work branches, driven through fake doors: a brief, a branch and the verbs over them.
// The doors these cases drive stand in work-doors.js beside this file.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import {
  CONTRACT_HEADING,
  changedIn,
  DONE,
  dependsOn,
  HELD,
  MERGED,
  MINE,
  setStatus,
  statusOf,
  TODO,
  waitingOn,
  withContract,
  work,
} from "../../src/scripts/work.js";
import { urgent } from "../../src/scripts/group.js";
import {
  doorsSaying,
  green,
  HERE,
  heard,
  onBranch,
  remoteSaying,
  ROOT,
  ranGit,
  SHA,
} from "./work-doors.js";

test("every brief carries the contract, and adding it twice changes nothing", () => {
  const once = withContract("# A brief\n\nDo the thing.\n");
  assert.ok(once.includes(CONTRACT_HEADING), "the contract lands");
  assert.ok(once.includes("./RUNME.sh branch done"), "it names how to finish");
  // [[spec/guidance/cloud]]
  assert.ok(once.includes("Stop for no person"), "it refuses the wait");
  assert.ok(
    once.includes("step under `by: person` as your own"),
    "it names who answers a person's step",
  );
  assert.equal(withContract(once), once, "a second pass changes nothing");
});

test("the status moves through todo, held and done", () => {
  const brief = setStatus("# A brief\n", TODO);
  assert.equal(statusOf(brief), TODO);
  assert.equal(statusOf(setStatus(brief, HELD)), HELD);
  assert.equal(statusOf(setStatus(setStatus(brief, HELD), DONE)), DONE);
  assert.equal(statusOf("# No frontmatter\n"), "");
});

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
  const brief =
    "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
    ["work/merged", MERGED],
  ]);
  assert.deepEqual(waitingOn(brief, standing), ["open", "busy", "ready"]);
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

// [[spec/design_output/config#a-caller-hands-it-in]]
test("new refuses a name past the words the caller hands in", () => {
  const { it } = doorsSaying(onBranch("main"), { [HERE]: "# A brief\n" });
  const name = "one-two-three-four-five-six";

  const { code, said } = heard(() => work(ROOT, ["new", name], { ...it, words: 5 }));

  assert.equal(code, 2);
  assert.equal(said, `A branch name holds 5 words, and ${name} holds more.`);
  assert.equal(heard(() => work(ROOT, ["new", name], { ...it, words: 6 })).code, 0);
});

test("done stamps the brief and pushes the branch it stands on", () => {
  const { it, outside, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
    ...green,
  });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.ok(ranGit(outside).includes("git push origin work/fix-lsp"));
});

test("done says one line to the log, naming the branch and the code", async () => {
  const { it, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
    ...green,
  });
  it.log = fakeLog(fakeClock(), { folder: "/log", id: "a6f8c43b" });

  const code = await heard(() => work(ROOT, ["done"], it)).code;

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.deepEqual(it.log.lines(), [
    {
      at: "2026-01-01T00:00:00.000Z",
      level: "info",
      kind: "work",
      said: "done answered 0",
      branch: "work/fix-lsp",
    },
  ]);
});

test("done off a work branch refuses, and reaches git no further", () => {
  const { it, outside } = doorsSaying(onBranch("main"), { [HERE]: "---\n---\n" });

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /branch done runs on a work branch/);
  assert.deepEqual(ranGit(outside), ["git rev-parse --abbrev-ref HEAD"]);
});

test("done with no brief on the tree refuses, because the brief is what comes back", () => {
  const { it } = doorsSaying(onBranch("work/fix-lsp"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /Write your result to HANDOVER\.md first/);
});

test("list names every branch, its status and what it waits for", () => {
  const { it } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/one", tip: "aaa" },
        { branch: "work/two", tip: "bbb" },
      ],
      {
        "work/one:HANDOVER.md": "---\nstatus: held\nurgent: true\n---\n",
        "work/two:HANDOVER.md": "---\nstatus: todo\ndepends_on:\n  - one\n---\n",
      },
    ),
  );

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one\s+brief\s+held\s+urgent/);
  assert.match(said, /work\/two\s+brief\s+todo\s+waits for one/);
});

test("list --done names the branch standing at done, and no other", () => {
  const { it } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/one", tip: "aaa" },
        { branch: "work/two", tip: "bbb" },
      ],
      {
        "work/one:HANDOVER.md": "---\nstatus: done\n---\n",
        "work/two:HANDOVER.md": "---\nstatus: todo\n---\n",
      },
    ),
  );

  const { said } = heard(() => work(ROOT, ["list", "", "--done"], it));

  assert.match(said, /work\/one/);
  assert.doesNotMatch(said, /work\/two/);
});

test("take claims the urgent branch, holds it, and prints the brief", () => {
  const brief = "---\nstatus: todo\nurgent: true\n---\n\n# Do the thing\n";
  const { it, outside, disk } = doorsSaying(
    {
      ...remoteSaying(
        [
          { branch: "work/calm", tip: "aaa" },
          { branch: "work/urgent", tip: "bbb" },
        ],
        {
          "work/calm:HANDOVER.md": "---\nstatus: todo\n---\n",
          "work/urgent:HANDOVER.md": brief,
        },
      ),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/urgent\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [HERE]: brief },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.ok(ranGit(outside).includes("git switch work/urgent"));
  assert.ok(ranGit(outside).includes("git push origin work/urgent"));
  assert.equal(statusOf(disk.read(HERE)), HELD);
  assert.match(said, /# Do the thing/);
});

test("take leaves a branch waiting on another one alone", () => {
  const { it, outside } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/first", tip: "aaa" },
        { branch: "work/second", tip: "bbb" },
      ],
      {
        "work/first:HANDOVER.md": "---\nstatus: held\n---\n",
        "work/second:HANDOVER.md": "---\nstatus: todo\ndepends_on:\n  - first\n---\n",
      },
    ),
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.match(said, /waits for first/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git switch")));
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
  const brief = "---\nstatus: todo\n---\n\n# Do the thing\n";
  const { it, outside } = doorsSaying(
    {
      "git status --porcelain": { stdout: " M spec/tickets/slow-lint.md" },
      ...remoteSaying([{ branch: "work/one", tip: "aaa" }], {
        "work/one:HANDOVER.md": brief,
      }),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/one\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [HERE]: brief, [PARKED_AT]: parked },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.doesNotMatch(said, /uncommitted changes/);
  assert.ok(ranGit(outside).includes("git switch work/one"));
});

// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
test("take puts every tagged file back, so the reset leaves the tag standing", () => {
  const brief = "---\nstatus: todo\n---\n\n# Do the thing\n";
  const { it, outside, disk } = doorsSaying(
    {
      "git status --porcelain": { stdout: " M spec/tickets/slow-lint.md" },
      ...remoteSaying([{ branch: "work/one", tip: "aaa" }], {
        "work/one:HANDOVER.md": brief,
      }),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/one\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [HERE]: brief, [PARKED_AT]: parked },
  );

  heard(() => work(ROOT, ["take"], it));

  const ran = ranGit(outside);
  assert.ok(ran.includes("git checkout -- spec/tickets/slow-lint.md"));
  assert.ok(
    ran.indexOf("git checkout -- spec/tickets/slow-lint.md") <
      ran.indexOf("git reset --hard origin/work/one"),
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

test("release puts a branch back to todo for somebody else", () => {
  const { it, outside, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
  });

  const { code } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), TODO);
  assert.ok(ranGit(outside).includes("git push origin work/fix-lsp"));
});

// A branch move resets onto origin, so a commit origin lacks dies under it. [[spec/design_output/work#a-branch-moves-clean]]
test("release refuses where the branch holds a commit origin lacks", () => {
  const { it, outside, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
    "git rev-list --count origin/work/fix-lsp..work/fix-lsp": { stdout: "2\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 2);
  assert.match(said, /holds 2 commit\(s\) origin lacks/);
  assert.match(said, /git push origin work\/fix-lsp/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git reset --hard")),
    "the reset that drops them runs nowhere",
  );
  assert.equal(disk.exists(HERE), false, "the brief on the tree stays untouched");
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

// [[spec/design_output/work#a-branch-moves-clean]]
test("a branch level with origin moves as before", () => {
  const { it } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
    "git rev-list --count origin/work/fix-lsp..work/fix-lsp": { stdout: "0\n" },
  });

  assert.equal(heard(() => work(ROOT, ["release"], it)).code, 0);
});

test("release refuses a branch already standing at done", () => {
  const { it, disk } = doorsSaying({
    "git rev-parse --abbrev-ref HEAD": { stdout: "work/fix-lsp\n" },
    "git show origin/work/fix-lsp:HANDOVER.md": { stdout: "---\nstatus: done\n---\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 1);
  assert.match(said, /Read it before you reopen it/);
  assert.equal(disk.exists(HERE), false, "the brief on the tree stays untouched");
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

// [[spec/design_output/work#trunk-comes-in-last-too]]
test("done refuses a branch trunk stands ahead of, and names the sync", () => {
  const held = "---\nstatus: held\n---\n\n# The result\n";
  const behind = doorsSaying(
    {
      ...onBranch("work/fix-lsp"),
      "git rev-list --count HEAD..origin/main": { stdout: "3\n" },
    },
    { [HERE]: held, ...green },
  );

  const { code, said } = heard(() => work(ROOT, ["done"], behind.it));
  assert.equal(code, 1);
  assert.match(said, /main holds 3 commit\(s\) work\/fix-lsp lacks/);
  assert.match(said, /branch sync/);
  assert.equal(statusOf(behind.disk.read(HERE)), "held", "the status stands");
});

// [[spec/design_output/work#the-battery-answers-first]]
test("done refuses where the battery answers nothing green", () => {
  const held = "---\nstatus: held\n---\n\n# The result\n";

  const none = doorsSaying(onBranch("work/fix-lsp"), { [HERE]: held });
  const first = heard(() => work(ROOT, ["done"], none.it));
  assert.equal(first.code, 1);
  assert.match(first.said, /no check has run here/);
  assert.equal(statusOf(none.disk.read(HERE)), "held");

  const stale = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({
      sha: "0000",
      ok: true,
      clean: true,
      at: "now",
    }),
  });
  assert.match(heard(() => work(ROOT, ["done"], stale.it)).said, /ran against 0000/);

  const red = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({
      sha: SHA,
      ok: false,
      clean: true,
      at: "now",
    }),
  });
  assert.match(heard(() => work(ROOT, ["done"], red.it)).said, /answered red/);

  const dirty = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({
      sha: SHA,
      ok: true,
      clean: false,
      at: "now",
    }),
  });
  assert.match(heard(() => work(ROOT, ["done"], dirty.it)).said, /unclean tree/);
});

// A branch carrying a group ticket is a group. [[spec/design_output/work#a-group-is-a-ticket]]
