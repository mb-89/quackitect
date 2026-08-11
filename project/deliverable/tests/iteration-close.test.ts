// THE SHIPPED ITERATION ARCHIVES ITSELF (owner ruling 2026-08-11): after
// the last bless the walk leaves through the terminal, and the close runs
// the expedition close's mechanics — merge, retire, worktree gone. This
// pins the mechanics; the walk's trigger rides advanceOutOfSub.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { itList, itSeed, readItRecord } from "../engine/iterations.ts";
import { itCloseShipped } from "../engine/worktree.ts";
import { freshRoot } from "./helpers.ts";

test("closing a shipped iteration merges, retires the record dir and drops the worktree", () => {
  const root = freshRoot();
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const it = itSeed(root, "prove the close", "a test iteration");
  assert.equal(itList(root).find((x) => x.id === it.id)?.open, true, "seeded and open");

  const out = itCloseShipped(root, it);
  assert.equal(out.closed, it.id);

  // The worktree is gone, so the archive lists it from now on.
  assert.equal(existsSync(it.path), false, "the worktree is removed");
  assert.equal(itList(root).find((x) => x.id === it.id)?.open, false, "the iteration reads closed");

  // The record dir retired from the trunk tree — the branch keeps serving it.
  assert.equal(existsSync(join(root, "project", "spec", "iterations", it.id)), false, "the record dir left the tree");
  const closed = itList(root).find((x) => x.id === it.id);
  assert.ok(closed, "the closed iteration still lists");
  const rec = readItRecord(root, closed);
  assert.equal(rec?.status, "shipped", "the record reads shipped from its branch");
  assert.match(String(rec?.closed ?? ""), /2\d{3}-/, "and carries its closed stamp");
});
