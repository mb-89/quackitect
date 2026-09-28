// The sync verb takes main in: into a work branch from trunk, and into a
// desk's main from the remote, stopping on a conflict so the hand resolves it.
// [[spec/tickets/sync-takes-origin-main]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { sync } from "../../src/scripts/work-stands.js";
import { doorsSaying, heard, onBranch, ROOT, ranGit } from "./work-doors.js";

const BEHIND = { "git rev-list --count HEAD..origin/main": { stdout: "2\n" } };
const ON_MAIN = "git merge origin/main --no-edit -m main: take origin/main in";

test("sync on main takes the remote's main in", () => {
  const { it, outside } = doorsSaying({ ...onBranch("main"), ...BEHIND });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.ok(ranGit(outside).includes(ON_MAIN), ranGit(outside).join("\n"));
  assert.match(said, /main took 2 commit\(s\) from origin\/main/);
});

test("sync on main stops on a conflict and leaves the merge to the hand", () => {
  const { it } = doorsSaying({
    ...onBranch("main"),
    ...BEHIND,
    [ON_MAIN]: { exitCode: 1 },
  });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 1);
  assert.match(said, /origin\/main conflicts with main/);
  assert.match(said, /git status names the files/);
});

test("sync on a work branch takes main in as before", () => {
  const { it, outside } = doorsSaying({ ...onBranch("work/one-group"), ...BEHIND });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.ok(
    ranGit(outside).includes(
      "git merge origin/main --no-edit -m work/one-group: take main in",
    ),
  );
  assert.match(said, /work\/one-group took 2 commit\(s\) from main/);
});

// [[spec/tickets/sync-takes-its-own-branch]]
const OWN =
  "git merge origin/work/one-group --no-edit -m work/one-group: take origin/work/one-group in";
const OWN_AHEAD = (count) => ({
  "git rev-list --count HEAD..origin/work/one-group": { stdout: `${count}\n` },
});

// [[spec/tickets/sync-takes-its-own-branch]]
test("sync on a work branch merges a diverged remote branch and keeps both sides", () => {
  const { it, outside } = doorsSaying({
    ...onBranch("work/one-group"),
    ...BEHIND,
    ...OWN_AHEAD(3),
  });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  const ran = ranGit(outside);
  assert.ok(ran.includes(OWN), ran.join("\n"));
  assert.ok(
    ran.indexOf(OWN) <
      ran.indexOf("git merge origin/main --no-edit -m work/one-group: take main in"),
    "the remote branch comes in before trunk",
  );
  assert.ok(
    !ran.some((one) => /rebase|reset|push --force/.test(one)),
    "no side is rewritten",
  );
  assert.match(said, /work\/one-group took 3 commit\(s\) from origin\/work\/one-group/);
  assert.match(said, /work\/one-group took 2 commit\(s\) from main/);
});

// [[spec/tickets/sync-takes-its-own-branch]]
test("sync on a work branch leaves the branch alone where the remote carries nothing new", () => {
  const { it, outside } = doorsSaying({
    ...onBranch("work/one-group"),
    ...BEHIND,
    ...OWN_AHEAD(0),
  });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.ok(!ranGit(outside).includes(OWN));
});

// [[spec/tickets/sync-takes-its-own-branch]]
test("a conflict with the remote branch stops and names the files", () => {
  const { it, outside } = doorsSaying({
    ...onBranch("work/one-group"),
    ...BEHIND,
    ...OWN_AHEAD(1),
    [OWN]: { exitCode: 1 },
  });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 1, said);
  assert.match(said, /origin\/work\/one-group conflicts with work\/one-group/);
  assert.match(said, /git status names the files/);
  assert.ok(
    !ranGit(outside).includes(
      "git merge origin/main --no-edit -m work/one-group: take main in",
    ),
    "trunk waits for the conflict",
  );
});

test("sync on any other branch refuses, and names where it runs", () => {
  const { it } = doorsSaying(onBranch("claude/a-thing"));
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 2);
  assert.match(
    said,
    /branch sync runs on main or a work branch, and this is claude\/a-thing/,
  );
});

// A conflict in a ticket's front alone merges key by key, and the merge commits. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
const TICKET = "spec/tickets/one-group.md";
const ON_WORK = "git merge origin/main --no-edit -m work/one-group: take main in";
const COMMITS = "git commit -m work/one-group: take main in";
const front = (...rows) => `---\n${rows.join("\n")}\n---\n\n# Ask\n\nOne thing.\n`;
const entry = (step) => [`  - step: ${step}`, "    hand: agent"];
const STAGES = {
  1: front("kind: [[ticket]]", "state: open", "record:", ...entry("sync")),
  2: front(
    "kind: [[ticket]]",
    "state: open",
    "record:",
    ...entry("sync"),
    ...entry("split"),
  ),
  3: front(
    "kind: [[ticket]]",
    "state: open",
    "record:",
    ...entry("sync"),
    "cloud: true",
  ),
};
const listed = (path, stages) =>
  stages.map((one) => `100644 abc${one} ${one}\t${path}`).join("\n");
const conflicting = (stages, more = {}) => {
  const answers = {
    ...onBranch("work/one-group"),
    ...BEHIND,
    [ON_WORK]: { exitCode: 1 },
    "git ls-files -u": { stdout: listed(TICKET, Object.keys(stages)) },
    ...more,
  };
  for (const [one, text] of Object.entries(stages))
    answers[`git show :${one}:${TICKET}`] = { stdout: text };
  const doors = doorsSaying(answers);
  doors.it.root = ROOT;
  return doors;
};

test("sync merges a record appended on the branch with a key main adds, and commits the merge", () => {
  const { it, outside, disk } = conflicting(STAGES);
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.equal(
    disk.read(join(ROOT, TICKET)),
    front(
      "kind: [[ticket]]",
      "state: open",
      "record:",
      ...entry("sync"),
      ...entry("split"),
      "cloud: true",
    ),
  );
  const ran = ranGit(outside);
  assert.ok(ran.includes(`git add -- ${TICKET}`), ran.join("\n"));
  assert.ok(ran.includes(COMMITS), ran.join("\n"));
  assert.match(said, /work\/one-group took 2 commit\(s\) from main/);
  assert.match(said, /The front of spec\/tickets\/one-group\.md merges on its own/);
});

test("sync leaves a key both sides change apart for a hand, names it, and commits nothing", () => {
  const stages = {
    ...STAGES,
    2: STAGES[2].replace("state: open", "state: closed"),
    3: STAGES[3].replace("state: open", "state: draft"),
  };
  const { it, outside } = conflicting(stages);
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 1);
  assert.ok(!ranGit(outside).includes(COMMITS));
  assert.match(said, /These wait for a hand:\n {2}spec\/tickets\/one-group\.md/);
  assert.match(
    said,
    /The write door lets a hand write each file until the merge commits/,
  );
});

test("sync names a ticket main retires while the branch changes it, and leaves it for a hand", () => {
  const { it, outside } = conflicting({ 1: STAGES[1], 2: STAGES[2] });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 1);
  assert.ok(!ranGit(outside).includes(COMMITS));
  assert.match(
    said,
    /one-group\.md: main retires this ticket, and work\/one-group changes it/,
  );
});
