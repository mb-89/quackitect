// A desk pull meeting no ticket hands out the cleanup: the check where its
// stamp reads failed or stale. A cloud box gets none of it.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { CLEANUP, cleanupOf } from "../../src/scripts/pull-cleanup.js";

const ROOT = "/tree";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const at = (rel) => join(ROOT, ...rel.split("/"));

function desk(files, more = {}) {
  const git = fakeGit({ "git rev-parse HEAD": { stdout: `${SHA}\n` } }, ROOT);
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

const stamped = (ok, sha = SHA) => ({ [at(STAMP)]: JSON.stringify({ sha, ok }) });

test("a failed or stale stamp hands out the check, and a green stamp at HEAD hands nothing", () => {
  for (const stamp of [stamped(false), stamped(true, "0".repeat(40)), {}]) {
    const said = cleanupOf(desk(stamp));
    assert.equal(said?.word, CLEANUP);
    assert.match(said.rows.join("\n"), /\.\/RUNME\.sh check/);
  }
  assert.equal(cleanupOf(desk(stamped(true))), null);
});

test("a cloud box meeting no ticket gets no cleanup", () => {
  const files = stamped(false);
  assert.equal(cleanupOf(desk(files))?.word, CLEANUP);
  assert.equal(cleanupOf(desk(files, { cloud: true })), null);
});
