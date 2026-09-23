// The commit verb over fake doors: a refused message stages nothing, and a
// clean one lands, checks and pushes.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { commitVerb } from "../../src/scripts/commit-verb.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

const ROOT = "/tree";
const CLEAN = "the-verb: the message reads clean";
const FOUND = [
  {
    rule: "VoiceShape.Antithesis",
    line: 1,
    column: 1,
    message: "Say what is.",
    severity: 2,
  },
];

const heard = async (what) => {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
};

const doors = (found = [], answers = {}) => {
  const git = fakeGit(
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/one-group\n" },
      ...answers,
    },
    ROOT,
  );
  const it = {
    root: ROOT,
    method: ROOT,
    join,
    node: "node",
    git,
    disk: fakeDisk({}),
    log: { say: () => {} },
    vale: { stands: () => true, lint: async () => ({ ran: true, found }) },
    proc: git.proc,
  };
  git.proc.teach([it.node, join(ROOT, "src", "scripts", "cli.js"), "check"], {
    exitCode: 0,
    stdout: "The rules pass.\n",
  });
  git.proc.teach([it.node, join(ROOT, "src", "scripts", "cli.js"), "test"], {
    exitCode: 0,
    stdout: "ok\n",
  });
  return { it, git };
};

const ranGit = (git) => git.ran.map((one) => one.argv.join(" "));

// [[spec/design_output/work#the-battery-answers-first]]
test("a message the rules refuse names every finding, and stages nothing", async () => {
  const { it, git } = doors(FOUND);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 2);
  assert.match(said, /refuse this message/);
  assert.match(said, /VoiceShape\.Antithesis/);
  assert.deepEqual(ranGit(git), [], "the tree stands untouched");
});

// [[spec/design_output/work#the-battery-answers-first]]
test("a clean message lands, runs the check, and pushes on green", async () => {
  const { it, git } = doors();

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0);
  const ran = ranGit(git);
  assert.ok(ran.includes("git add -A"));
  assert.ok(ran.includes(`git commit -m ${CLEAN}`));
  assert.ok(ran.includes("git push origin work/one-group"));
  assert.match(said, /the check answers green/);
});

// [[spec/design_output/work#the-battery-answers-first]]
test("a red check holds the push back, and names what the check refuses", async () => {
  const { it, git } = doors();
  // The check writes its faults to the error stream, and its last passing line to the other. [[spec/design_output/work#one-verb-feeds-that-stamp]]
  git.proc.teach([it.node, join(ROOT, "src", "scripts", "cli.js"), "check"], {
    exitCode: 1,
    stdout: "The server stands at http://127.0.0.1:6510/health.\n",
    stderr: "src/a.js:1:1: Passive: Write in the active voice.\n",
  });

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /no push reaches origin/);
  assert.match(said, /Passive: Write in the active voice/, "the fault reaches the reader");
  assert.ok(!ranGit(git).some((one) => one.startsWith("git push")));
});

// [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("a staging the door refuses names what git says, and commits nothing", async () => {
  const { it, git } = doors([], {
    "git add -A": { exitCode: 1, stderr: "the index stands locked" },
  });

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /the index stands locked/);
  assert.ok(!ranGit(git).some((one) => one.startsWith("git commit")));
});

// [[spec/design_output/pull#the-refused-commit]]
test("a commit the door refuses lands nothing, and the staging comes back", async () => {
  const { it, git } = doors([], {
    [`git commit -m ${CLEAN}`]: { exitCode: 1, stderr: "the hook refuses it" },
  });

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /nothing lands/);
  assert.match(said, /the hook refuses it/, "the door's own line reaches the reader");
  assert.ok(ranGit(git).includes("git reset -q"), "the staging comes back");
});

// [[spec/design_output/work#the-battery-answers-first]]
test("the no-push flag leaves the branch where it stands", async () => {
  const { it, git } = doors();

  const { code } = await heard(() => commitVerb(it, [CLEAN, "--no-push"]));

  assert.equal(code, 0);
  assert.ok(!ranGit(git).some((one) => one.startsWith("git push")));
});

// The tests gate the commit, so a red run stages nothing and commits nothing. [[spec/design_output/work#the-battery-answers-first]]
test("a red test run commits nothing, and names what the run says", async () => {
  const { it, git } = doors();
  git.proc.teach([it.node, join(ROOT, "src", "scripts", "cli.js"), "test"], {
    exitCode: 1,
    stdout: "not ok 1 - the door refuses\n",
  });

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /not ok 1 - the door refuses/);
  const ran = ranGit(git);
  assert.ok(!ran.includes("git add -A"), "nothing stages");
  assert.ok(!ran.some((one) => one.startsWith("git commit")), "nothing commits");
});
