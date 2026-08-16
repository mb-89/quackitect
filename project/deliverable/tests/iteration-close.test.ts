// THE SHIPPED ITERATION ARCHIVES ITSELF (owner ruling 2026-08-11): after the
// last bless the walk leaves through the terminal and the close runs. This
// pins the mechanics; the walk's trigger rides advanceOutOfSub.
//
// WHAT i34 REVERSED, and this case with it. The close used to merge the
// record's branch to trunk, run `git rm -r` on the record's directory and
// remove the worktree — under the 2026-07-28 ruling that closed records live
// in git and the tree carries only live work.
//
// THE ARCHIVE LIVES ON DISK NOW, so the folder stays and there is nothing to
// merge or remove. What the close does is stamp the record.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { itList, itSeed, readItRecord } from "../engine/iterations.ts";
import { itCloseShipped } from "../engine/worktree.ts";
import { freshRoot } from "./helpers.ts";

test("closing a shipped iteration stamps the record and leaves its folder standing", () => {
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

  // THE FOLDER STAYS. That is what lets the archive read a closed record from
  // disk instead of out of git, and it is what removes the retrieval path.
  const dir = join(root, "project", "spec", "iterations", it.id);
  assert.equal(existsSync(dir), true, "the record's folder stands in the tree");
  assert.equal(existsSync(join(dir, "record.md")), true, "and the record itself is readable");

  // AND IT READS CLOSED, from its own status rather than from a missing
  // directory. Those were the same answer before and are not any more.
  const closed = itList(root).find((x) => x.id === it.id);
  assert.ok(closed, "the closed iteration still lists");
  assert.equal(closed.open, false, "the iteration reads closed");
  const rec = readItRecord(root, closed);
  assert.equal(rec?.status, "shipped", "the record reads shipped from the tree");
  assert.match(String(rec?.closed ?? ""), /2\d{3}-/, "and carries its closed stamp");
});
