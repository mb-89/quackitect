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
import {
  BRIEF,
  CONTRACT_HEADING,
  DONE,
  dependsOn,
  HELD,
  MINE,
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

const onBranch = (name) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${name}\n` },
});

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

test("a branch waits only for one still standing at todo or held", () => {
  const brief = "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - gone\n---\n";
  const standing = new Map([
    ["work/open", TODO],
    ["work/busy", HELD],
    ["work/ready", DONE],
  ]);
  assert.deepEqual(waitingOn(brief, standing), ["open", "busy"]);
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

test("done stamps the brief and pushes the branch it stands on", () => {
  const { it, outside, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
  });

  const { code } = heard(() => work(ROOT, ["done"], it));

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.ok(ranGit(outside).includes("git push origin work/fix-lsp"));
});

test("done says one line to the log, naming the branch and the code", async () => {
  const { it, disk } = doorsSaying(onBranch("work/fix-lsp"), {
    [HERE]: "---\nstatus: held\n---\n\n# The result\n",
  });
  it.log = fakeLog(fakeClock(), { folder: "/log", id: "a6f8c43b" });

  const code = await heard(() => work(ROOT, ["done"], it)).code;

  assert.equal(code, 0);
  assert.equal(statusOf(disk.read(HERE)), DONE);
  assert.deepEqual(it.log.lines(), [
    {
      at: "2026-01-01T00:00:00.000Z",
      level: "info",
      door: "work",
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

test("close holds a trunk carrying commits origin has never seen", () => {
  const { it, outside } = doorsSaying({
    "git rev-list --count origin/main..main": { stdout: "2\n" },
  });

  const { code, said } = heard(() => work(ROOT, ["close"], it));

  assert.equal(code, 1);
  assert.match(said, /Push main first/);
  assert.ok(!ranGit(outside).some((one) => one.includes("--delete")));
});
