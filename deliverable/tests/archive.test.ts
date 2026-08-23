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
//
// THE CALL MOVED IN i4 and this test followed it. Building the model and
// drawing it are two files now, and the fetch belongs to the model half. What
// is pinned is unchanged: ONE call across the whole render path, wherever in
// that path it sits.
//
// BOTH FILES ARE COUNTED TOGETHER on purpose. Checking only the new home would
// let a second call site reappear in the old one and say nothing.
const RENDER_PATH = ["../engine/render.ts", "../engine/viewmodel.ts"];

test("the render fetches the expedition list once, not once per state", () => {
  const src = RENDER_PATH.map((rel) => readFileSync(new URL(rel, import.meta.url), "utf8")).join("\n");
  // Match the CALL (a receiver, then the method) so prose about it does not count.
  const calls = src.match(/\.expeditionList\(\)/g) ?? [];
  assert.equal(calls.length, 1, "one expeditionList call across the whole render path");
});

// THE BRANCH-CACHE CASE IS DELETED (i34). It pinned that a closed record was
// read out of `git show <branch>:<rel>` once and then cached, because the
// close removed the folder and the branch was the only place left holding it.
//
// THE FOLDER STAYS NOW, so a record is a file and the filesystem is the cache.
// There is no branch read, no fallback and no cache to assert about.
