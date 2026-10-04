// The commit verb over fake doors: a refused message stages nothing, and a
// clean one lands, checks and pushes.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { commitVerb } from "../../src/scripts/commit-verb.js";
import { conflicted, NAMED, named } from "./fixtures.js";
import { carryQuack, quackUnder } from "./quack-doors.js";

const ROOT = "/tree";
// The tests and the check the verb runs, each a verb quack registers. [[spec/tickets/check-verbs-port-to-go]]
const ROAD = (verb) => [quackUnder(ROOT), "verb", join(ROOT, "src", "scripts"), verb];
const TESTS = ROAD("test").join(" ");
const CHECKS = ROAD("check").join(" ");
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
  carryQuack(it);
  git.proc.teach(ROAD("check"), {
    exitCode: 0,
    stdout: "The rules pass.\n",
  });
  git.proc.teach(ROAD("test"), {
    exitCode: 0,
    stdout: "ok\n",
  });
  return { it, git };
};

const ranGit = (git) =>
  git.ran.filter((one) => one.argv[0] === "git").map((one) => one.argv.join(" "));

// The cold gate's doors: a staged list, a client on the disk, and a probe answering a code and its lines. [[spec/design_output/level0#the-cold-probe]]
const CLIENT = "/bin/claude";
const LISTED = "git diff --cached --name-only --no-renames";
const cold = (
  staged,
  probed = { code: 0, lines: ["PASS hook: row"] },
  client = CLIENT,
) => {
  const { it, git } = doors([], { [LISTED]: { stdout: `${staged.join("\n")}\n` } });
  const asked = [];
  it.claude = client;
  it.disk.write(CLIENT, "");
  it.cold = async (root, _it, via, say, delta) => {
    asked.push({ root, via, delta });
    for (const one of probed.lines) say(one);
    return probed.code;
  };
  return { it, git, asked };
};

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
  git.proc.teach(ROAD("check"), {
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
  assert.ok(
    ranGit(git).includes("git reset -q -- ."),
    "the staging comes back, and a merge stands",
  );
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
  git.proc.teach(ROAD("test"), {
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
  const tests = ran.indexOf(TESTS);
  const staged = ran.indexOf("git add -A");
  const committed = ran.indexOf(`git commit -m ${CLEAN}`);
  const checked = ran.indexOf(CHECKS);
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
  assert.ok(
    ran.includes("git add -A -- spec/tickets/new-name.md"),
    "the staged-away old path stays out of the add",
  );
  assert.ok(ran.includes(`git commit -m ${CLEAN} ${both}`), "the commit takes both");
  assert.ok(!ran.some((one) => one.includes("src/a.js")), "an unnamed path stays out");
});

// A rename rewriting a file past git's similarity cut reads as a delete and an add, so the rename journal names the old path. [[spec/tickets/rename-detection-misses-rewrites]]
test("a commit naming a renamed path lands the old path the rename journal names, where git reads no rename", async () => {
  const { it, git } = doors([], {
    "git diff --cached --name-status -M": {
      stdout: "D\tspec/tickets/old-name.md\nA\tspec/tickets/new-name.md\n",
    },
  });
  it.disk.makeDir(join(ROOT, ".se", ".runtime", "undo"));
  it.disk.write(
    join(ROOT, ".se", ".runtime", "undo", "20260101000000000000.json"),
    JSON.stringify({
      by: "rename",
      files: [],
      moved: { from: "spec/tickets/old-name.md", to: "spec/tickets/new-name.md" },
    }),
  );

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "spec/tickets/new-name.md", "--no-push"]),
  );

  assert.equal(code, 0);
  const both = "-- spec/tickets/new-name.md spec/tickets/old-name.md";
  const ran = ranGit(git);
  assert.ok(
    ran.includes("git add -A -- spec/tickets/new-name.md"),
    "the old path the rename staged away stays out of the add",
  );
  assert.ok(ran.includes(`git commit -m ${CLEAN} ${both}`), "the commit takes both");
});

// git add refuses a path standing neither on disk nor in the index, so a journaled old path stages only where it stands. [[spec/tickets/commit-stages-a-moved-path]]
test("a journaled old path the index still holds stages with the new path", async () => {
  const { it, git } = doors([], {
    "git diff --cached --name-status -M": { stdout: "A\tspec/tickets/new-name.md\n" },
    "git ls-files --cached -- spec/tickets/old-name.md": {
      stdout: "spec/tickets/old-name.md\n",
    },
  });
  it.disk.makeDir(join(ROOT, ".se", ".runtime", "undo"));
  it.disk.write(
    join(ROOT, ".se", ".runtime", "undo", "20260101000000000000.json"),
    JSON.stringify({
      by: "rename",
      files: [],
      moved: { from: "spec/tickets/old-name.md", to: "spec/tickets/new-name.md" },
    }),
  );

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "spec/tickets/new-name.md", "--no-push"]),
  );

  assert.equal(code, 0);
  const both = "-- spec/tickets/new-name.md spec/tickets/old-name.md";
  const ran = ranGit(git);
  assert.ok(ran.includes(`git add -A ${both}`), "the old path stages with the new");
  assert.ok(ran.includes(`git commit -m ${CLEAN} ${both}`), "the commit takes both");
});

// A rename that landed long ago leaves its old path nowhere, and git refuses a pathspec matching nothing. [[spec/tickets/commit-skips-landed-moves]]
test("a journaled old path standing nowhere stays out of the commit", async () => {
  const { it, git } = doors([], {
    "git diff --cached --name-status -M": { stdout: "M\tspec/tickets/new-name.md\n" },
  });
  it.disk.makeDir(join(ROOT, ".se", ".runtime", "undo"));
  it.disk.write(
    join(ROOT, ".se", ".runtime", "undo", "20260101000000000000.json"),
    JSON.stringify({
      by: "rename",
      files: [],
      moved: { from: "spec/tickets/old-name.md", to: "spec/tickets/new-name.md" },
    }),
  );

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "spec/tickets/new-name.md", "--no-push"]),
  );

  assert.equal(code, 0);
  const ran = ranGit(git);
  assert.ok(
    ran.includes(`git commit -m ${CLEAN} -- spec/tickets/new-name.md`),
    ran.join("\n"),
  );
  const lands = ran.filter((one) => /^git (add|commit) /.test(one));
  assert.ok(
    !lands.some((one) => one.includes("old-name")),
    "the old path joins no pathspec",
  );
});

// A move an earlier commit lands leaves its journal behind, and its old path stands nowhere, so the commit names the new path alone. [[spec/tickets/commit-stages-a-moved-path]]
test("a path under a journaled folder move standing nowhere stays out of the commit", async () => {
  const { it, git } = doors([], {
    "git diff --cached --name-status -M": {
      stdout: "M\tsrc/modules/index/lease_test.go\n",
    },
  });
  it.disk.makeDir(join(ROOT, ".se", ".runtime", "undo"));
  it.disk.write(
    join(ROOT, ".se", ".runtime", "undo", "20260101000000000000.json"),
    JSON.stringify({
      by: "rename",
      files: [],
      moved: { from: "src/watchdog", to: "src/modules/index" },
    }),
  );

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "src/modules/index/lease_test.go", "--no-push"]),
  );

  assert.equal(code, 0);
  const ran = ranGit(git);
  assert.ok(
    ran.includes(`git commit -m ${CLEAN} -- src/modules/index/lease_test.go`),
    "the commit names the new path alone",
  );
  assert.ok(
    !ran.some((one) => /^git (add|commit)/.test(one) && one.includes("src/watchdog")),
    "the old path stays out of the add and the commit",
  );
});

// [[spec/design_output/level0#the-cold-probe]]
test("a staged file on the cold path runs the probe after the tests and before the commit", async () => {
  const { it, git, asked } = cold(["src/quack/main.go", "README.md"]);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0, said);
  assert.equal(asked.length, 1, "the probe runs once");
  assert.equal(asked[0].via, CLIENT);
  assert.match(said, /The cold probe passes/);
  const ran = git.ran.map((one) => one.argv.join(" "));
  assert.ok(ran.indexOf(TESTS) >= 0, "the tests run");
  assert.ok(ran.indexOf(TESTS) < ran.indexOf(LISTED), "the tests run before the probe reads");
  assert.ok(
    ran.includes("git diff --cached --binary --no-renames"),
    "the delta reaches the probe",
  );
  assert.ok(ran.indexOf(LISTED) < ran.indexOf(`git commit -m ${CLEAN}`));
});

test("a staged list off the cold path runs no probe", async () => {
  const { it, git, asked } = cold(["README.md", "src/bridge/answer.js"]);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0);
  assert.equal(asked.length, 0);
  assert.doesNotMatch(said, /cold probe/);
  assert.ok(ranGit(git).includes(`git commit -m ${CLEAN}`));
});

test("a failing cold probe refuses the commit, prints its lines, and unstages", async () => {
  const { it, git } = cold([".claude/skills/level0/hooks/level0.js"], {
    code: 1,
    lines: ["PASS hook: row", "FAIL canary: no level0 row names the sentence"],
  });

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /FAIL canary: no level0 row names the sentence/);
  assert.match(said, /nothing lands/);
  const ran = ranGit(git);
  assert.ok(!ran.some((one) => one.startsWith("git commit")), "nothing commits");
  assert.ok(
    ran.includes("git reset -q -- ."),
    "the staging comes back, and a merge stands",
  );
});

test("a cold-path commit on a box holding no claude refuses in one line", async () => {
  const { it, git, asked } = cold(["src/scripts/install.sh"], undefined, "claude");

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.equal(asked.length, 0);
  assert.match(said, /claude stands nowhere/);
  assert.equal(said.split("\n").filter((one) => /claude/.test(one)).length, 1);
  assert.ok(!ranGit(git).some((one) => one.startsWith("git commit")));
});

test("a call naming paths gates on the paths it lands alone", async () => {
  const { it, git, asked } = cold(["src/bridge/guidance.js"]);
  git.proc.teach(
    ["git", ...`${LISTED.slice(4)} -- src/bridge/guidance.js`.split(" ")],
    {
      stdout: "src/bridge/guidance.js\n",
    },
  );

  const { code } = await heard(() =>
    commitVerb(it, [CLEAN, "src/bridge/guidance.js", "--no-push"]),
  );

  assert.equal(code, 0);
  assert.equal(asked.length, 1);
  assert.ok(
    ranGit(git).includes(
      "git diff --cached --binary --no-renames -- src/bridge/guidance.js",
    ),
  );
});

// The verb concludes a merge once its files carry no marker, so a marker left on disk refuses before the tests run. [[spec/design_output/work#no-commit-carries-a-marker]]
test("an unmerged file still carrying a marker refuses the commit and stages nothing", async () => {
  const path = "spec/tickets/a-group.md";
  const { it, git } = doors([], {
    "git ls-files -u": { stdout: `100644 abc123 2\t${path}\n` },
  });
  it.disk.write(join(ROOT, path), `${conflicted(["a: 1"], ["b: 2"]).join("\n")}\n`);

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 1);
  assert.match(said, /spec\/tickets\/a-group\.md:1 {2}a conflict marker/);
  assert.ok(!ranGit(git).includes("git add -A"), ranGit(git).join("\n"));
});

test("an unmerged file written clean lands the merge through the verb", async () => {
  const path = "spec/tickets/a-group.md";
  const { it, git } = doors([], {
    "git ls-files -u": { stdout: `100644 abc123 2\t${path}\n` },
  });
  it.disk.write(join(ROOT, path), "---\nstate: open\n---\n");

  const { code, said } = await heard(() => commitVerb(it, [CLEAN]));

  assert.equal(code, 0, said);
  assert.ok(ranGit(git).includes(`git commit -m ${CLEAN}`));
});
