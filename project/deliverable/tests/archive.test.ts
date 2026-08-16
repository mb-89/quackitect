// THE ARCHIVE MUST NOT COST A GIT SPAWN PER RECORD, PER RECORD.
//
// Opening the expedition archive hung the whole server (owner, 2026-07-29:
// "it really makes the whole system hang"). Building the page loops over every
// archived expedition, and inside that loop it called expeditionList() — which
// spawns `git branch --list` and then a separate `git show` for every record.
//
// With 19 closed expeditions that is 19 x 20 blocking subprocesses on EVERY
// render. spawnSync holds the event loop, so nothing else could be answered
// while it ground through them.
//
// It was slow every time because the record read had no cache of its own: the
// batching that already existed lives in a different function, on a path the
// archive never took.
//
// Two invariants, pinned here rather than in a comment.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The list does not vary per state, so it is fetched once for the whole
// render. A second call site is the quadratic bug coming back.
test("the render fetches the expedition list once, not once per state", () => {
  const src = readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
  // Match the CALL (a receiver, then the method) so prose about it does not count.
  const calls = src.match(/\.expeditionList\(\)/g) ?? [];
  assert.equal(calls.length, 1, "one expeditionList call for the whole render");
});

// THE BRANCH READ AND ITS CACHE ARE GONE (i34). A closed expedition's record
// used to live on its branch — "history is git's, the tree carries only live
// work" — so readRecord fell back to `git show <branch>:<rel>` and cached the
// result, because a closed branch never moves.
//
// THE ARCHIVE LIVES ON DISK NOW. The folder stays through the close, so the
// record is a file and the filesystem is the cache.
//
// WHAT THIS CASE ASSERTS INSTEAD is the absence, because that is the whole
// demand: req-a-closed-records-folder-stays-on-trunk exists so that no path
// reads a record out of git.
test("a record is read from the tree, never out of git", () => {
  const src = readFileSync(new URL("../engine/worktree.ts", import.meta.url), "utf8");
  // THE FUNCTION ALONE, not everything up to the next export — the branch
  // LISTING sits between them and legitimately spawns git.
  const from = src.indexOf("export function readRecord");
  const readRecord = src.slice(from, src.indexOf("\n}", from));
  assert.equal(/spawnSync/.test(readRecord), false, "reading a record spawns nothing");
  assert.equal(/git show/.test(readRecord), false, "and never asks git for a blob");
  assert.equal(/branchRecords/.test(readRecord), false, "so there is no branch read left to cache");
  assert.ok(/existsSync\(abs\)/.test(readRecord), "it looks for one file, in the tree");
});
