// A desk pull meeting no ticket hands out the cleanup: the oldest file on the
// refactor list the hand holds no hold on, then the check where its stamp
// reads failed or stale. A cloud box gets none of it.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  REFACTOR_HOLD,
  REFACTORS,
  STAMP,
} from "../../.claude/skills/level0/lib/runs.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { CLEANUP, cleanupOf } from "../../src/scripts/pull-cleanup.js";

const ROOT = "/tree";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const at = (rel) => join(ROOT, ...rel.split("/"));
const row = (file) => ({ file, rule: "Sentence", line: 1, severity: "warning" });

function desk(files, more = {}) {
  const git = fakeGit(
    {
      "git rev-parse HEAD": { stdout: `${SHA}\n` },
      "git log -1 --format=%ct -- old.md": { stdout: "100\n" },
      "git log -1 --format=%ct -- new.md": { stdout: "200\n" },
    },
    ROOT,
  );
  return {
    root: ROOT,
    work: ROOT,
    disk: fakeDisk(files),
    git,
    join,
    clock: fakeClock(),
    cloud: false,
    ...more,
  };
}

const listed = (...names) => ({ [at(REFACTORS)]: JSON.stringify(names.map(row)) });
const stamped = (ok, sha = SHA) => ({ [at(STAMP)]: JSON.stringify({ sha, ok }) });

test("a desk meeting no ticket takes the oldest file on the refactor list", () => {
  const said = cleanupOf(desk({ ...listed("new.md", "old.md"), ...stamped(true) }));
  assert.equal(said?.word, CLEANUP);
  assert.match(said.rows.join("\n"), /Take old\.md/);
});

// The hand walks its whole list, whatever each file's age. [[spec/design_output/stop#the-hand-walks-the-list]]
test("a file written this second still goes out as the cleanup", () => {
  const clock = fakeClock();
  const now = Math.floor(clock.now().getTime() / 1000);
  const it = desk({ ...listed("fresh.md"), ...stamped(true) }, { clock });
  it.git = fakeGit(
    {
      "git rev-parse HEAD": { stdout: `${SHA}\n` },
      "git log -1 --format=%ct -- fresh.md": { stdout: `${now}\n` },
    },
    ROOT,
  );
  const said = cleanupOf(it);
  assert.equal(said?.word, CLEANUP);
  assert.match(said.rows.join("\n"), /Take fresh\.md/);
});

test("a file the refactoring hand holds stays out of the cleanup", () => {
  const held = {
    [at(REFACTOR_HOLD)]: JSON.stringify({ file: "old.md", hand: "a1", since: 0 }),
  };
  const said = cleanupOf(desk({ ...listed("new.md", "old.md"), ...held }));
  assert.equal(said?.word, CLEANUP);
  assert.match(said.rows.join("\n"), /Take new\.md/);
});

test("an empty list and a failed or stale stamp hand out the check, and a green stamp at HEAD hands nothing", () => {
  for (const stamp of [stamped(false), stamped(true, "0".repeat(40)), {}]) {
    const said = cleanupOf(desk({ ...listed(), ...stamp }));
    assert.equal(said?.word, CLEANUP);
    assert.match(said.rows.join("\n"), /\.\/RUNME\.sh check/);
  }
  assert.equal(cleanupOf(desk({ ...listed(), ...stamped(true) })), null);
});

test("a cloud box meeting no ticket gets no cleanup", () => {
  const files = { ...listed("old.md"), ...stamped(false) };
  assert.equal(cleanupOf(desk(files))?.word, CLEANUP);
  assert.equal(cleanupOf(desk(files, { cloud: true })), null);
});
