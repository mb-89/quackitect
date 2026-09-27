// A revert or a reset over a pull commit, which the take-back verb undoes in
// one move. The parse cases hand the rule a table of subjects, and the door
// cases hand it a fake process answering a lone commit apart from a walk.
// [[spec/design_output/bash#a-pull-commit-stands]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { findings, verbLine } from "../../.claude/skills/level0/lib/bash.js";
import { TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { NAMED, named, VERB_ALONE } from "./fixtures.js";

const ROOT = "/tree";
const PULL = "a-child: passes design/draft";
const PLAIN = "fix the lint";

// The subjects a revision answers, and every read the rule asks for. [[spec/design_output/bash#a-pull-commit-stands]]
function reading(table, tickets = ["spec/tickets/a-child.md"]) {
  const asked = [];
  return {
    asked,
    subjects: (one) => {
      asked.push(one);
      return table[one.revs.join(" ")] ?? [];
    },
    script: (path) => (tickets.includes(path) ? "# Ask\n" : ""),
  };
}

const refusals = (command, it) =>
  findings(command, 5, it).filter((one) => one.rule === "PullCommitStands");

test("a revert over a pull commit refuses, and names the take-back verb with the leaf", () => {
  const it = reading({ abc123: [PULL] });
  const said = refusals("git revert abc123", it);
  assert.equal(said.length, 1);
  assert.match(
    said[0].message,
    /\.\/RUNME\.sh ticket pull a-child --back design\/draft/,
  );
  assert.deepEqual(it.asked, [{ revs: ["abc123"], walks: false }]);
});

test("a reset over a range holding a pull commit refuses, and reads the range alone", () => {
  const it = reading({ "HEAD~2..HEAD": [PLAIN, PULL] });
  const said = refusals("git reset --hard HEAD~2", it);
  assert.equal(said.length, 1);
  assert.match(said[0].message, /ticket pull a-child --back design\/draft/);
  assert.deepEqual(it.asked, [{ revs: ["HEAD~2..HEAD"], walks: true }]);
});

test("a revert over a plain commit passes, and a bare reset or one over paths reads nothing", () => {
  const it = reading({ abc123: [PLAIN] });
  assert.deepEqual(refusals("git revert abc123", it), []);
  for (const command of [
    "git reset",
    "git reset --hard",
    "git reset -- a.js",
    "git reset HEAD a.js",
  ]) {
    assert.deepEqual(refusals(command, it), [], command);
  }
  assert.deepEqual(it.asked, [{ revs: ["abc123"], walks: false }]);
});

test("a flag and its value stay out of the revisions, so -m 1 names no commit", () => {
  const it = reading({ abc123: [PULL] });
  assert.equal(refusals("git revert -m 1 --no-edit abc123", it).length, 1);
  assert.deepEqual(it.asked, [{ revs: ["abc123"], walks: false }]);
});

test("a subject naming no ticket passes, and a ticket in the private folder counts", () => {
  const none = reading({ abc123: ["the funnel note: one more line"] });
  assert.deepEqual(refusals("git revert abc123", none), []);
  const held = reading({ abc123: [PULL] }, [`${TICKETS}/a-child.md`]);
  assert.equal(refusals("git revert abc123", held).length, 1);
});

test("the leaf reads off each subject form, and a subject naming none says <leaf>", () => {
  for (const [subject, leaf] of [
    ["a-child: fails design/review back to design/draft", "design/review"],
    ["a-child: design/review fails back to design/draft", "design/review"],
    ["a-child: helper-2 takes implement/change back", "implement/change"],
    [
      "a-child: passes implement/tests-red, skips implement/reflect",
      "implement/tests-red",
    ],
    ["a-child: opens", "<leaf>"],
  ]) {
    const said = refusals("git revert abc123", reading({ abc123: [subject] }));
    assert.equal(said.length, 1, subject);
    assert.ok(said[0].message.includes(`--back ${leaf}`), subject);
  }
});

// [[spec/design_output/bash#the-description-names-verbs]]
test("the description names the refusal of a revert or a reset over a pull commit", () => {
  assert.match(verbLine(), /a revert or a reset over a pull commit/);
});

// A call names its ticket at the head of its description, so a case wraps its command with the shared open one. [[spec/design_output/level0#a-shell-names-its-ticket]]
const call = (command) => ({ command, description: `${NAMED}: drives the door` });

// The fake answers a lone commit apart from a walk under it, so the door passes only where it reads the commit alone. [[spec/design_output/bash#a-pull-commit-stands]]
function box() {
  return {
    env: {},
    disk: fakeDisk({ ...named(ROOT), [`${ROOT}/spec/tickets/a-child.md`]: "# Ask\n" }),
    proc: fakeProc({
      "git log --no-walk --format=%s abc123": { stdout: `${PLAIN}\n` },
      "git log --format=%s abc123": { stdout: `${PLAIN}\n${PULL}\n` },
      "git log --no-walk --format=%s def456": { stdout: `${PULL}\n` },
      "git log --format=%s HEAD~2..HEAD": { stdout: `${PLAIN}\n${PULL}\n` },
      "git log --format=%s HEAD~1..HEAD": { stdout: `${PLAIN}\n` },
    }),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

test("the door reads a reverted commit alone, and refuses a pull commit it takes back", async () => {
  assert.match(denied(await onBash(call("git revert abc123"), box())), VERB_ALONE);
  assert.match(
    denied(await onBash(call("git revert def456"), box())),
    /ticket pull a-child --back design\/draft/,
  );
});

test("the door refuses a reset over a pull commit, and one over plain commits meets the verb rule alone", async () => {
  assert.match(
    denied(await onBash(call("git reset --hard HEAD~2"), box())),
    /PullCommitStands/,
  );
  assert.match(
    denied(await onBash(call("git reset --hard HEAD~1"), box())),
    VERB_ALONE,
  );
});
