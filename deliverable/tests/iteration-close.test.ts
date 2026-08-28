// THE SHIPPED ITERATION ARCHIVES ITSELF: after the
// last bless the walk leaves through the terminal and the close runs. This
// pins the mechanics; the walk's trigger rides advanceOutOfSub.
//
// THE ARCHIVE LIVES ON DISK, so the folder stays and there is nothing to
// merge or remove. What the close does is stamp the record.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { itList, itSeed, readItRecord } from "../engine/iterations.ts";
import { itCloseShipped } from "../engine/records.ts";
import { freshRoot } from "./helpers.ts";

/** A SEED COMMITS, so a fresh root has to be a repository before one is made.
 *  Every case here needs it, so it is made once rather than copied. */
function repoAt(root: string): void {
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
}

test("closing a shipped iteration stamps the record and leaves its folder standing", () => {
  const root = freshRoot();
  repoAt(root);
  const it = itSeed(root, "prove the close", "a test iteration");
  assert.equal(itList(root).find((x) => x.id === it.id)?.open, true, "seeded and open");

  const out = itCloseShipped(root, it);
  assert.equal(out.closed, it.id);

  // THE FOLDER STAYS. That is what lets the archive read a closed record from
  // disk instead of out of git, and it is what removes the retrieval path.
  const dir = join(root, "spec", "iterations", it.id);
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

// AN ABANDONED RECORD LEAVES THE OPEN SET.
//
// WHY THE WORD EXISTS. A record whose work is no longer wanted, or whose
// outcome arrived by another road, fits neither of the other two. `shipped`
// would claim gates that never happened, and putting it back to `seeded` would
// claim work that was never begun.
//
// THIS PINS THE SET RATHER THAN A VERB. Every reader of a record's standing
// derives from RECORD_FINISHED, so proving the set is what proves them all.
test("an abandoned iteration reads as not open", () => {
  const root = freshRoot();
  repoAt(root);
  const it = itSeed(root, "prove the abandonment", "a test iteration");
  assert.equal(itList(root).find((x) => x.id === it.id)?.open, true, "seeded and open");

  const rec = join(root, "spec", "iterations", it.id, "record.md");
  const before = readFileSync(rec, "utf8");
  assert.match(before, /^status: seeded$/m, "a seed starts seeded");
  writeFileSync(rec, before.replace(/^status: seeded$/m, "status: abandoned"), "utf8");

  const after = itList(root).find((x) => x.id === it.id);
  assert.ok(after, "the abandoned iteration still lists");
  assert.equal(after.open, false, "and it is no longer open");

  // THE RECORD KEEPS EVERYTHING. The standing speaks about the future, and it
  // never removes what the walk already produced.
  assert.equal(existsSync(rec), true, "the record itself stands");
  assert.equal(readItRecord(root, after)?.status, "abandoned", "and reads its own standing back");
});

// A WORD NOBODY DECLARED IS STILL OPEN. The guard is the whole point of one
// definition: a typo in a status must not quietly retire a record.
test("an unknown status leaves a record open", () => {
  const root = freshRoot();
  repoAt(root);
  const it = itSeed(root, "prove the guard", "a test iteration");
  const rec = join(root, "spec", "iterations", it.id, "record.md");
  writeFileSync(rec, readFileSync(rec, "utf8").replace(/^status: seeded$/m, "status: abandonned"), "utf8");
  assert.equal(itList(root).find((x) => x.id === it.id)?.open, true, "a misspelling does not retire it");
});
