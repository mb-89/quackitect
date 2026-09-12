// Work branches, driven through fake doors. The verbs reach git and the disk
// through arguments, so every case here runs in memory and the branch it moves
// stands in a map.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import {
  BRIEF,
  CONTRACT_HEADING,
  DONE,
  dependsOn,
  freeNow,
  HELD,
  MERGED,
  MINE,
  standingOf,
  setStatus,
  statusOf,
  TODO,
  URGENCY,
  urgencyOf,
  waitingOn,
  withContract,
  work,
} from "../../src/scripts/work.js";

const ROOT = "/tree";
const HERE = join(ROOT, BRIEF);

function doorsSaying(answers, files = {}) {
  const said = fakeGit(answers, ROOT);
  const disk = fakeDisk(files);
  return { it: { proc: said.proc, disk, git: said, join }, outside: said, disk };
}

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));

const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";

const onBranch = (name) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${name}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
});

const green = {
  [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: true, clean: true, at: "now" }),
};

test("every brief carries the contract, and adding it twice changes nothing", () => {
  const once = withContract("# A brief\n\nDo the thing.\n");
  assert.ok(once.includes(CONTRACT_HEADING), "the contract lands");
  assert.ok(once.includes("./RUNME.sh work done"), "it names how to finish");
  assert.ok(once.includes("./RUNME.sh work release"), "it names how to stop early");
  assert.equal(withContract(once), once, "a second pass changes nothing");
});

test("the status moves through todo, held and done", () => {
  const brief = setStatus("# A brief\n", TODO);
  assert.equal(statusOf(brief), TODO);
  assert.equal(statusOf(setStatus(brief, HELD)), HELD);
  assert.equal(statusOf(setStatus(setStatus(brief, HELD), DONE)), DONE);
  assert.equal(statusOf("# No frontmatter\n"), "");
});

test("urgency reads from the frontmatter, and soon is the default", () => {
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: now\n---\n"), "now");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: whenever\n---\n"), "whenever");
  assert.equal(urgencyOf("---\nstatus: todo\n---\n"), "soon");
  assert.equal(urgencyOf("---\nstatus: todo\nurgency: yesterday\n---\n"), "soon");
});

test("a dependency reads as a list or on one line, with the prefix dropped", () => {
  const block = "---\ndepends_on:\n  - one\n  - work/two\n---\n";
  assert.deepEqual(dependsOn(block), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: a, work/b\n---\n"), ["a", "b"]);
  assert.deepEqual(dependsOn("---\nstatus: todo\n---\n"), []);
});

// [[spec/design_output/work#urgency-and-what-waits]]
test("a dependency in a flow list reads without its brackets or its quotes", () => {
  assert.deepEqual(dependsOn("---\ndepends_on: [one, work/two]\n---\n"), ["one", "two"]);
  assert.deepEqual(dependsOn('---\ndepends_on: ["one", \'two\']\n---\n'), ["one", "two"]);
  assert.deepEqual(dependsOn("---\ndepends_on: []\n---\n"), []);
  assert.deepEqual(dependsOn('---\ndepends_on:\n  - "one"\n---\n'), ["one"]);
});

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
test("a branch waits for a dependency until trunk holds it", () => {
  const brief = "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
    ["work/merged", MERGED],
  ]);
  assert.deepEqual(waitingOn(brief, standing), ["open", "busy", "ready"]);
});

test("a dependency done and unmerged holds its dependent, and merged frees it", () => {
  const said = (status, waits) =>
    `---\nstatus: ${status}\n${waits ? `depends_on: ${waits}\n` : ""}---\n\n# A brief\n`;
  const briefs = new Map([
    ["work/the-schema-reads", said(DONE)],
    ["work/the-schema-refuses", said(TODO, "the-schema-reads")],
  ]);
  assert.deepEqual(freeNow(briefs), [], "done waits on a person's merge");
  assert.deepEqual(freeNow(briefs, new Set(["work/the-schema-reads"])), [
    "work/the-schema-refuses",
  ]);
  assert.equal(standingOf(briefs, new Set(["work/the-schema-reads"])).get("work/the-schema-reads"), MERGED);
});

test("urgency orders now before soon before whenever", () => {
  const order = ["whenever", "now", "soon"].sort(
    (a, b) => URGENCY.indexOf(a) - URGENCY.indexOf(b),
  );
  assert.deepEqual(order, ["now", "soon", "whenever"]);
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
  assert.match(said, /work done runs on a work branch/);
  assert.deepEqual(ranGit(outside), ["git rev-parse --abbrev-ref HEAD"]);
});

test("done with no brief on the tree refuses, because the brief is what comes back", () => {
  const { it } = doorsSaying(onBranch("work/fix-lsp"));

  const { code, said } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 2);
  assert.match(said, /Write your result to HANDOVER\.md first/);
});

test("list names every branch, its status and what it waits for", () => {
  const { it } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/one\nbbb\trefs/heads/work/two\n",
    },
    "git show origin/work/one:HANDOVER.md": {
      stdout: "---\nstatus: held\nurgency: now\n---\n",
    },
    "git show origin/work/two:HANDOVER.md": {
      stdout: "---\nstatus: todo\ndepends_on:\n  - one\n---\n",
    },
  });

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one\s+held\s+now/);
  assert.match(said, /work\/two\s+todo\s+waits for one/);
});

test("collect names the branch standing at done, and no other", () => {
  const { it } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/one\nbbb\trefs/heads/work/two\n",
    },
    "git show origin/work/one:HANDOVER.md": { stdout: "---\nstatus: done\n---\n" },
    "git show origin/work/two:HANDOVER.md": { stdout: "---\nstatus: todo\n---\n" },
  });

  const { said } = heard(() => work(ROOT, ["collect"], it));

  assert.match(said, /work\/one/);
  assert.doesNotMatch(said, /work\/two/);
});

test("take claims the urgent branch, holds it, and prints the brief", () => {
  const brief = "---\nstatus: todo\nurgency: now\n---\n\n# Do the thing\n";
  const { it, outside, disk } = doorsSaying(
    {
      "git ls-remote --heads origin work/*": {
        stdout: "aaa\trefs/heads/work/calm\nbbb\trefs/heads/work/urgent\n",
      },
      "git show origin/work/calm:HANDOVER.md": {
        stdout: "---\nstatus: todo\nurgency: whenever\n---\n",
      },
      "git show origin/work/urgent:HANDOVER.md": { stdout: brief },
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
  const { it, outside } = doorsSaying({
    "git ls-remote --heads origin work/*": {
      stdout: "aaa\trefs/heads/work/first\nbbb\trefs/heads/work/second\n",
    },
    "git show origin/work/first:HANDOVER.md": { stdout: "---\nstatus: held\n---\n" },
    "git show origin/work/second:HANDOVER.md": {
      stdout: "---\nstatus: todo\ndepends_on:\n  - first\n---\n",
    },
  });

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
    ranGit(shut.outside).includes("git push origin --delete claude/roaming-hopper-ab12cd"),
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
    [join(ROOT, STAMP)]: JSON.stringify({ sha: "0000", ok: true, clean: true, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], stale.it)).said, /ran against 0000/);

  const red = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: false, clean: true, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], red.it)).said, /answered red/);

  const dirty = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: held,
    [join(ROOT, STAMP)]: JSON.stringify({ sha: SHA, ok: true, clean: false, at: "now" }),
  });
  assert.match(heard(() => work(ROOT, ["done"], dirty.it)).said, /unclean tree/);
});

test("freeNow names a branch at todo waiting on nobody, and no other", () => {
  const said = (status, waits) =>
    `---\nstatus: ${status}\n${waits ? `depends_on: ${waits}\n` : ""}---\n\n# A brief\n`;

  const free = freeNow(
    new Map([
      ["work/open", said(TODO)],
      ["work/waiting", said(TODO, "open")],
      ["work/holding", said(HELD)],
      ["work/finished", said(DONE)],
    ]),
  );

  assert.deepEqual(free, ["work/open"]);
});

test("freeNow frees a branch whose dependency left the queue", () => {
  const waits = `---\nstatus: ${TODO}\ndepends_on: merged-already\n---\n\n# A brief\n`;

  assert.deepEqual(freeNow(new Map([["work/late", waits]])), ["work/late"]);
});
