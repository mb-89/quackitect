// The commit verb over fake doors: a refused message stages nothing, and a
// clean one lands, checks and pushes.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { commitVerb } from "../../src/scripts/commit-verb.js";
import { NAMED, named } from "./fixtures.js";

const ROOT = "/tree";
const CLEAN = `${NAMED}: the message reads clean`;
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

const doors = (found = [], answers = {}, env = { SE_CLOUD: "1" }) => {
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
    disk: fakeDisk(named(ROOT)),
    log: { say: () => {} },
    vale: { stands: () => true, lint: async () => ({ ran: true, found }) },
    proc: git.proc,
    env,
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

// A break of form in the message warns, and the commit lands. [[spec/design_output/work#the-battery-answers-first]]
test("a message breaking a rule of form names every finding, and the commit lands", async () => {
  const { it, git } = doors(FOUND);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0);
  assert.match(said, /break a rule of form, and the commit lands/);
  assert.match(said, /VoiceShape\.Antithesis/);
  assert.ok(ranGit(git).includes(`git commit -m ${CLEAN}`), "the commit lands");
});

// A private name leaves no box, so the message stays refused. [[spec/design_output/work#the-battery-answers-first]]
test("a message carrying a private name is refused, and stages nothing", async () => {
  const { it, git } = doors([{ ...FOUND[0], rule: "VoiceVale.Private" }]);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 2);
  assert.match(said, /refuse this message/);
  assert.match(said, /VoiceVale\.Private/);
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
  assert.match(
    said,
    /Passive: Write in the active voice/,
    "the fault reaches the reader",
  );
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

// A desk's verb pushes nothing. [[spec/guidance/working]]
test("a desk lands and checks the commit on main, and pushes nothing", async () => {
  const { it, git } = doors(
    [],
    { "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    {},
  );

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0);
  assert.ok(ranGit(git).includes(`git commit -m ${CLEAN}`));
  assert.ok(!ranGit(git).some((one) => one.startsWith("git push")));
  assert.match(said, /the check answers green/);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's commit on a work branch refuses, names main, and runs no test and stages nothing", async () => {
  const { it, git } = doors([], {}, {});

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 2);
  assert.match(said, /A desk works on main alone/);
  assert.match(said, /git switch main/);
  assert.deepEqual(ranGit(git), ["git rev-parse --abbrev-ref HEAD"]);
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

// The tests run before anything stages, and the check runs after the commit, so the stamp names the commit that lands. [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("the tests run before the staging, and the check after the commit", async () => {
  const { it, git } = doors();

  await heard(() => commitVerb(it, [CLEAN]));

  const ran = git.ran.map((one) => one.argv.join(" "));
  const cli = join(ROOT, "src", "scripts", "cli.js");
  const tests = ran.indexOf(`node ${cli} test`);
  const staged = ran.indexOf("git add -A");
  const committed = ran.indexOf(`git commit -m ${CLEAN}`);
  const checked = ran.indexOf(`node ${cli} check`);
  assert.ok(tests >= 0 && tests < staged, "the tests run first");
  assert.ok(committed < checked, "the check stamps the commit");
});

// A call naming paths stages and commits those alone, so a helper's files stand apart from the landing. [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("a call naming paths lands those paths alone", async () => {
  const { it, git } = doors();

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "src/a.js", "test/a.test.js", "--no-push"]),
  );

  assert.equal(code, 0);
  const ran = ranGit(git);
  assert.ok(ran.includes("git add -A -- src/a.js test/a.test.js"), "the paths stage");
  assert.ok(
    ran.includes(`git commit -m ${CLEAN} -- src/a.js test/a.test.js`),
    "the commit takes the paths alone",
  );
  assert.ok(!ran.includes("git add -A"), "the whole tree stays unstaged");
});

// A rename stages the move, and a commit naming the new path takes the old path's deletion with it. [[spec/design_output/work#one-verb-feeds-that-stamp]]
test("a commit naming a renamed ticket lands the old path's deletion with it", async () => {
  const { it, git } = doors([], {
    "git diff --cached --name-status -M": {
      stdout: "R100\tspec/tickets/old-name.md\tspec/tickets/new-name.md\nM\tsrc/a.js\n",
    },
  });

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "spec/tickets/new-name.md", "--no-push"]),
  );

  assert.equal(code, 0);
  const ran = ranGit(git);
  const both = "-- spec/tickets/new-name.md spec/tickets/old-name.md";
  assert.ok(ran.includes(`git add -A ${both}`), "the old path stages with the new");
  assert.ok(ran.includes(`git commit -m ${CLEAN} ${both}`), "the commit takes both");
  assert.ok(!ran.some((one) => one.includes("src/a.js")), "an unnamed path stays out");
});
