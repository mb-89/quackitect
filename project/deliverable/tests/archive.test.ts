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

// A closed expedition's branch never moves, so its record is read once per
// session. The MERGED copy is deliberately NOT cached — retro edits land
// there and it has to stay truthful.
test("a closed record is read from its branch once, then cached", () => {
  const src = readFileSync(new URL("../engine/worktree.ts", import.meta.url), "utf8");
  assert.ok(/branchRecords/.test(src), "the branch fallback caches");
  const fallback = src.slice(src.indexOf("export function readRecord"));
  const cacheAt = fallback.indexOf("branchRecords.has");
  const spawnAt = fallback.indexOf('spawnSync("git", ["show"');
  assert.ok(cacheAt !== -1 && spawnAt !== -1, "both the cache check and the spawn are present");
  assert.ok(cacheAt < spawnAt, "the cache is consulted BEFORE git is spawned");
  const merged = fallback.indexOf("existsSync(merged)");
  assert.ok(merged !== -1 && merged < cacheAt, "the merged copy is still read fresh, ahead of the cache");
});
