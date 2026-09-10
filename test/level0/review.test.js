// The reader, driven through fake doors. The verb reaches git, the disk and a
// process through arguments, so every case here runs in memory and the branch
// it reads stands in a table.
// [[spec/design_output/review#what-the-verb-gathers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  CALLED,
  readerAsks,
  readerSays,
  report,
  retroIn,
  reviewSpec,
  TOOL,
  WORKTREE,
} from "../../.claude/skills/level0/lib/review.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { whatFailed } from "../../src/scripts/review.js";
import { work } from "../../src/scripts/work.js";

const ROOT = "/tree";
const NAME = "the-config-holds-numbers";
const BRANCH = `work/${NAME}`;
const REF = `origin/${BRANCH}`;
const FIRST = "1111111111111111111111111111111111111111";
const AT = join(ROOT, WORKTREE, "work-the-config-holds-numbers");

const BRIEF = "---\nstatus: todo\n---\n\n# Hold the numbers\n";
const HANDBACK = "---\nstatus: done\n---\n\n# It holds\n\n# Retro\n\nOne surprise.\n";

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

const standing = (more = {}) => ({
  "git fetch --prune origin": { exitCode: 0 },
  "git rev-parse --verify --quiet origin/work/the-config-holds-numbers": {
    stdout: "aaa\n",
  },
  "git rev-parse --verify --quiet origin/main": { stdout: "bbb\n" },
  [`git rev-list --reverse origin/main..${REF}`]: { stdout: `${FIRST}\n2222\n` },
  [`git show ${FIRST}:HANDOVER.md`]: { stdout: BRIEF },
  [`git show ${REF}:HANDOVER.md`]: { stdout: HANDBACK },
  [`git diff --stat origin/main...${REF}`]: { stdout: " src/a.js | 2 +-\n" },
  [`git diff origin/main...${REF}`]: { stdout: "diff --git a/src/a.js\n" },
  "git worktree prune": { exitCode: 0 },
  [`git worktree add --detach ${AT} ${REF}`]: { exitCode: 0 },
  [`git worktree remove --force ${AT}`]: { exitCode: 0 },
  "/node src/scripts/cli.js check": { exitCode: 0, stdout: "1..3\n# pass 3\n" },
  ...more,
});

function doorsSaying(answers, files = {}) {
  const said = fakeGit(answers, ROOT);
  const disk = fakeDisk({ [join(ROOT, TOOLS)]: '{"node":{"path":"/node"}}', ...files });
  return {
    it: { root: ROOT, proc: said.proc, disk, git: said, node: "/node", join },
    outside: said,
    disk,
  };
}

const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));

test("a retro reads from a heading, and its absence reads as absent", () => {
  assert.equal(retroIn("# The result\n\n## Retro\n\nA surprise.\n"), true);
  assert.equal(retroIn("# The result\n\n# My retrospective\n\nA surprise.\n"), true);
  assert.equal(retroIn("# The result\n\nI wrote a retro somewhere.\n"), false);
  assert.equal(retroIn(""), false);
});

test("the verb gathers the brief, the handback and both diffs", () => {
  const { it } = doorsSaying(standing());

  const { code, said } = heard(() => work(ROOT, ["review", NAME, "--json"], it));

  assert.equal(code, 0);
  const material = JSON.parse(said);
  assert.equal(material.branch, BRANCH);
  assert.equal(material.ref, REF);
  assert.equal(material.brief, BRIEF.trim());
  assert.equal(material.handback, HANDBACK.trim());
  assert.match(material.stat, /src\/a\.js/);
  assert.match(material.diff, /diff --git/);
});

test("the verb answers the check and the retro, and no model runs", () => {
  const { it, outside } = doorsSaying(standing());

  const { code, said } = heard(() => work(ROOT, ["review", NAME, "--json"], it));
  const material = JSON.parse(said);

  assert.equal(code, 0);
  assert.equal(material.check.ok, true);
  assert.equal(material.check.code, 0);
  assert.equal(material.retro, true);
  assert.ok(
    ranGit(outside).includes(`git worktree add --detach ${AT} ${REF}`),
    "the check opens a worktree on the branch",
  );
});

test("the check runs on the surveyed tools, so the worktree downloads none", () => {
  const { it, disk } = doorsSaying(standing());
  const runs = [];
  it.proc.teach(["/node", "src/scripts/cli.js", "check"], (argv, init) => {
    runs.push({ argv, cwd: init.cwd, survey: disk.exists(join(AT, TOOLS)) });
    return { exitCode: 0 };
  });

  heard(() => work(ROOT, ["review", NAME, "--json"], it));

  assert.equal(runs.length, 1, "the check runs once");
  assert.equal(runs[0].cwd, AT, "it runs inside the worktree");
  assert.equal(runs[0].survey, true, "the survey lands there first");
});

test("a red check comes back with the rows the runner refused", () => {
  const { it } = doorsSaying(
    standing({
      "/node src/scripts/cli.js check": {
        exitCode: 1,
        stdout: "ok 1 - a\nnot ok 2 - the door holds\nnot ok 3 - the rule fires\n",
      },
    }),
  );

  const { said } = heard(() => work(ROOT, ["review", NAME, "--json"], it));
  const material = JSON.parse(said);

  assert.equal(material.check.ok, false);
  assert.equal(material.check.code, 1);
  assert.match(material.check.says, /not ok 2 - the door holds/);
  assert.match(material.check.says, /not ok 3 - the rule fires/);
});

test("the verb refuses a branch standing nowhere, and says which", () => {
  const { it } = doorsSaying({
    "git fetch --prune origin": { exitCode: 0 },
    "git rev-parse --verify --quiet origin/work/gone": { exitCode: 1 },
    "git rev-parse --verify --quiet work/gone": { exitCode: 1 },
  });

  const { code, said } = heard(() => work(ROOT, ["review", "gone"], it));

  assert.equal(code, 1);
  assert.match(said, /work\/gone stands nowhere/);
});

test("the verb refuses a branch carrying no commit beyond trunk", () => {
  const { it } = doorsSaying(
    standing({ [`git rev-list --reverse origin/main..${REF}`]: { stdout: "\n" } }),
  );

  const { code, said } = heard(() => work(ROOT, ["review", NAME], it));

  assert.equal(code, 1);
  assert.match(said, /carries no commit beyond origin\/main/);
});

test("the verb refuses a review naming no branch", () => {
  const { it, outside } = doorsSaying({});

  const { code, said } = heard(() => work(ROOT, ["review"], it));

  assert.equal(code, 2);
  assert.match(said, /work review needs a name/);
  assert.deepEqual(ranGit(outside), [], "it reaches git no further");
});

test("the report names the branch, every answer and the count", () => {
  const said = report(
    { branch: BRANCH, check: { ok: true, code: 0 }, retro: true },
    {
      brief: "done, and nothing beyond it",
      beyond: "src/scripts/tools.js, a one-line fix, trivial",
      tests: "2 rules added, 1 carries no test:\nStopRule fires on nothing",
      fix: 2,
    },
  );

  assert.match(said, /^work\/the-config-holds-numbers$/m);
  assert.match(said, /^check {6}passes$/m);
  assert.match(said, /^retro {6}present$/m);
  assert.match(said, /^tests {6}2 rules added, 1 carries no test:$/m);
  assert.match(said, /^ {11}StopRule fires on nothing$/m);
  assert.match(said, /^2 things to fix, and the merge is a person's\.$/m);
});

test("a report with nothing to fix fits on one line", () => {
  const said = report(
    { branch: BRANCH, check: { ok: true, code: 0 }, retro: true },
    { brief: "done, and nothing beyond it", fix: 0 },
  );

  assert.equal(said.split("\n").length, 1);
  assert.match(said, /nothing to fix, and the merge is a person's\./);
});

test("a red check and an absent retro each count one thing to fix", () => {
  const said = report(
    { branch: BRANCH, check: { ok: false, code: 1 }, retro: false },
    { fix: 0 },
  );

  assert.match(said, /^check {6}answers 1$/m);
  assert.match(said, /^retro {6}absent from the handback$/m);
  assert.match(said, /^2 things to fix/m);
});

test("the report holds no merge back, whatever it finds", () => {
  const bad = report(
    { branch: BRANCH, check: { ok: false, code: 1 }, retro: false },
    { brief: "the brief asks for two things, and one lands", fix: 4 },
  );

  assert.match(bad, /the merge is a person's\./);
  assert.equal(/\bblock|\brefus|\bdeny|\bgate\b/i.test(bad), false);
});

test("the reader answers JSON, and a fenced answer reads the same", () => {
  const plain = readerSays('{"brief":"done","beyond":"none","tests":"all","fix":1}');
  assert.deepEqual(plain, { fix: 1, brief: "done", beyond: "none", tests: "all" });

  const fenced = readerSays(
    'Here it is:\n```json\n{"brief":"done","beyond":"none","tests":"all","fix":1}\n```\n',
  );
  assert.deepEqual(fenced, plain);
});

test("a reader answering no JSON hands its words over, and counts one", () => {
  const said = readerSays("I could not read the diff.");

  assert.equal(said.fix, 1);
  assert.equal(said.unread, "I could not read the diff.");
  const shown = report({ branch: BRANCH, check: { ok: true }, retro: true }, said);
  assert.match(shown, /^reader {5}I could not read the diff\.$/m);
});

test("a list in an answer reads as one line each", () => {
  const said = readerSays('{"tests":["one","two"],"fix":"2"}');

  assert.equal(said.tests, "one\ntwo");
  assert.equal(said.fix, 0, "a count that is no number reads as none");
});

test("the reader prompt carries the material and the rules", () => {
  const asked = readerAsks(
    { branch: BRANCH, brief: BRIEF, handback: HANDBACK, stat: "a | 1", diff: "@@" },
    "1. Do the thing. *",
  );

  assert.match(asked, /Does the branch do what the brief asks/);
  assert.match(asked, /trivial fix/);
  assert.match(asked, /proving it fires/);
  assert.match(asked, /Hold the numbers/);
  assert.match(asked, /1\. Do the thing\. \*/);
  assert.match(asked, /@@/);
});

test("the tool takes one branch name and says it holds no merge", () => {
  const spec = reviewSpec();

  assert.equal(spec.name, TOOL);
  assert.equal(CALLED, "mcp__level0__review_branch");
  assert.deepEqual(spec.inputSchema.required, ["branch"]);
  assert.match(spec.description, /holds no merge back/);
});

test("a run naming no failing row falls back to its last lines", () => {
  const said = whatFailed({ stdout: "one\ntwo\n", stderr: "the rules refuse three\n" });

  assert.match(said, /the rules refuse three/);
});

test("a red lint answers with the lines naming the rule", () => {
  const said = whatFailed({
    stdout: "The rules pass.\nspec/a.md:8:11: PastTense: Write the present tense.\n",
    stderr: "",
  });

  assert.equal(said, "spec/a.md:8:11: PastTense: Write the present tense.");
});

// [[spec/design_output/review#what-the-report-looks-like]]
test("the report says what a red check broke on, under the check row", () => {
  const said = report(
    {
      branch: BRANCH,
      retro: true,
      check: { ok: false, code: 1, says: "not ok 3 - the door holds" },
    },
    { fix: 0 },
  );

  assert.match(said, /^check {6}answers 1:$/m);
  assert.match(said, /^ {11}not ok 3 - the door holds$/m);
  assert.match(said, /^1 thing to fix/m);
});

// [[spec/design_output/review#what-the-report-looks-like]]
test("the verb alone prints the two rows it owns, and no brief", () => {
  const { it } = doorsSaying(
    standing({ [`git show ${REF}:HANDOVER.md`]: { stdout: BRIEF } }),
  );

  const { code, said } = heard(() => work(ROOT, ["review", NAME], it));

  assert.equal(code, 0);
  assert.match(said, /^check {6}passes$/m);
  assert.match(said, /^retro {6}absent from the handback$/m);
  assert.equal(said.includes("Hold the numbers"), false, "the brief stays out");
  assert.match(said, /^1 thing to fix, and the merge is a person's\.$/m);
});

// [[spec/design_output/review#three-dots-not-two]]
test("the diff runs from the merge base, so trunk's own work stays out", () => {
  const { it, outside } = doorsSaying(standing());

  heard(() => work(ROOT, ["review", NAME, "--json"], it));

  const ran = ranGit(outside);
  assert.ok(ran.includes(`git diff origin/main...${REF}`), "three dots, not two");
  assert.equal(
    ran.includes(`git diff origin/main..${REF}`),
    false,
    "a two-dot diff reads trunk's later commits as this branch removing them",
  );
});
