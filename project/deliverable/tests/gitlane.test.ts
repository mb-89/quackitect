// The git lane (v2 port): allowlisted git with its laws as refusals —
// no push (SE-C-003), no rebase (SE-C-002), allowlist only (SE-C-004),
// restore unstages only.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { dirtyLines } from "../engine/gitlane.ts";
import { visitState } from "../engine/session.ts";

// A VISIT IS RECORDED QUALIFIED, and the graph-is-evidence check compared it
// against the bare state name. It matched nothing, so the check passed
// vacuously: every expedition closed so far was never looked at, and one of
// them had nineteen open points standing when that was measured.
//
// A flag computed and never compared is this codebase's recurring defect. It
// hides because a check that SEES nothing reports exactly like a check that
// FINDS nothing.
test("a recorded visit yields its state, however deep the container", () => {
  assert.equal(visitState("expeditions/e30@0"), "e30", "the container prefix is not part of the name");
  assert.equal(visitState("expeditions/e30-leave@2"), "e30-leave");
  assert.equal(visitState("e30"), "e30", "an unqualified visit still works");
  assert.equal(visitState("iterations/i1/walk@7"), "walk", "and it reaches the innermost state at any depth");
});

import { bootedServer, call, freshRoot } from "./helpers.ts";

// A narrated call writes the record's decision trail INTO the bound worktree,
// so a walk that is narrating can never present a clean tree. A sync is wanted
// exactly when an expedition is entered, which is when narration is heaviest,
// and the two refused each other: riding an update on the sync dirtied the
// tree before the sync checked it.
test("the dirty gate excuses the engine's own trail, and nothing else", () => {
  const trail = " M project/spec/expeditions/e31-x/decisions.jsonl";
  assert.deepEqual(dirtyLines(trail), [], "the engine's own trail is not somebody's uncommitted work");
  assert.deepEqual(dirtyLines("?? project/spec/iterations/i1-y/decisions.jsonl"), [], "an iteration's trail likewise");
  const real = `${trail}\n M project/guidance/voice.md`;
  assert.deepEqual(dirtyLines(real), [" M project/guidance/voice.md"], "real work still blocks a reconcile");
  assert.deepEqual(dirtyLines(""), [], "a clean tree stays clean");
  // A merge cannot silently bury an untracked file — git aborts if one
  // would be overwritten, and that abort refuses typed. Counting them
  // deadlocked e31's land behind its own ignore rule.
  assert.deepEqual(dirtyLines("?? project/.mcp.json\n?? project/.claude/"), [], "untracked files never block a reconcile");
  assert.deepEqual(dirtyLines("?? new-idea.md\n M engine/run.ts"), [" M engine/run.ts"], "a tracked modification still does");
});

// LAND and SYNC reconcile a worktree WITH trunk, so both need two trees. At
// the root there is only one, and a silent no-op there would be worse than a
// refusal — the caller would believe their work had gone across.
test("land and sync refuse when nothing is bound", async () => {
  const server = await bootedServer(freshRoot());
  for (const tool of ["se_git_land", "se_git_sync"]) {
    const r = await call(server, tool, {});
    assert.equal(r.isError, true, `${tool} must refuse at the root`);
    assert.equal(r.body.clause, "SE-C-004");
    assert.match(String(r.body.got), /with nothing bound/);
  }
});

function gitInit(root: string): void {
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
}

test("se_git: the status/add/commit flow works through the lane", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  writeFileSync(join(root, "x.md"), "hi\n");
  const st = await call(server, "se_git", { args: ["status", "--porcelain"] });
  assert.equal(st.isError, false, JSON.stringify(st.body));
  assert.match(String(st.body.stdout), /x\.md/);
  const add = await call(server, "se_git", { args: ["add", "--", "x.md"] });
  assert.equal(add.body.ok, true, JSON.stringify(add.body));
  const ci = await call(server, "se_git", { args: ["commit", "-m", "lane commit"] });
  assert.equal(ci.body.ok, true, JSON.stringify(ci.body));
});

test("se_git laws: no push, no rebase, allowlist only, restore unstages only", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const push = await call(server, "se_git", { args: ["push"] });
  assert.equal(push.isError, true);
  assert.equal(push.body.clause, "SE-C-003");
  const rebase = await call(server, "se_git", { args: ["rebase", "main"] });
  assert.equal(rebase.body.clause, "SE-C-002");
  const clean = await call(server, "se_git", { args: ["clean", "-fd"] });
  assert.equal(clean.body.clause, "SE-C-004");
  const restore = await call(server, "se_git", { args: ["restore", "x.md"] });
  assert.equal(restore.body.clause, "SE-C-004");
  writeFileSync(join(root, "y.md"), "stage me\n");
  await call(server, "se_git", { args: ["add", "--", "y.md"] });
  const unstage = await call(server, "se_git", { args: ["restore", "--staged", "y.md"] });
  assert.equal(unstage.isError, false, JSON.stringify(unstage.body));
});

// The rebase refusal names merge as the way a diverged branch reconciles.
// For years it named a door the allowlist had locked, so the only way to
// sync a bound expedition with trunk was a shell command. Merge is lane
// work now; rebase stays refused, because only one of the two rewrites
// history.
test("se_git: merge is lane work, and it reconciles a diverged branch", async () => {
  const root = freshRoot();
  gitInit(root);
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  writeFileSync(join(root, "base.md"), "base\n");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const trunk = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout.trim();
  // A branch cut at the base, exactly as an expedition is cut at seed time.
  g("checkout", "-q", "-b", "side");
  writeFileSync(join(root, "side.md"), "side\n");
  g("add", "-A");
  g("commit", "-q", "-m", "side work");
  // Trunk moves on underneath it — the staleness that caused the conflicts.
  g("checkout", "-q", trunk);
  writeFileSync(join(root, "trunk.md"), "trunk\n");
  g("add", "-A");
  g("commit", "-q", "-m", "trunk work");
  g("checkout", "-q", "side");

  const server = await bootedServer(root);
  const merged = await call(server, "se_git", { args: ["merge", "--no-edit", trunk] });
  assert.equal(merged.isError, false, JSON.stringify(merged.body));
  assert.equal(merged.body.ok, true, JSON.stringify(merged.body));
  // Trunk's commit is reachable from the branch now: it really synced.
  const log = await call(server, "se_git", { args: ["log", "--oneline"] });
  assert.match(String(log.body.stdout), /trunk work/, "trunk's work came across");
  assert.match(String(log.body.stdout), /side work/, "and the branch kept its own");

  // Rebase is still refused. Merge being legal must not read as history
  // rewriting being legal.
  const rebase = await call(server, "se_git", { args: ["rebase", trunk] });
  assert.equal(rebase.body.clause, "SE-C-002", "rebase stays refused");
});

// TAKING A SIDE (gap hit live 2026-07-30, e26): merging was lane-legal and
// RESOLVING was not, so seventeen conflict blocks went through the agent's
// context by hand. The form is narrow on purpose — a side, a named path, and
// a merge actually in progress.
test("se_git: one side of a conflict can be taken, and only mid-merge", async () => {
  const root = freshRoot();
  gitInit(root);
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    // The merge is MEANT to conflict, so only that one may fail.
    if (r.status !== 0 && a[0] !== "merge") throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  writeFileSync(join(root, "c.md"), "base\n");
  g("add", "-A");
  g("commit", "-q", "-m", "base");
  const trunk = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout.trim();
  g("checkout", "-q", "-b", "other");
  writeFileSync(join(root, "c.md"), "theirs\n");
  g("add", "-A");
  g("commit", "-q", "-m", "theirs");
  g("checkout", "-q", trunk);
  writeFileSync(join(root, "c.md"), "ours\n");
  g("add", "-A");
  g("commit", "-q", "-m", "ours");

  const server = await bootedServer(root);
  // A bare checkout switches branches or discards edits. Never legal.
  const bare = await call(server, "se_git", { args: ["checkout", "other"] });
  assert.equal(bare.isError, true);
  assert.match(String(bare.body.expected), /--ours/);
  // With no merge running there are no sides, and this would throw away work.
  const early = await call(server, "se_git", { args: ["checkout", "--theirs", "c.md"] });
  assert.equal(early.isError, true);
  assert.match(String(early.body.got), /no MERGE_HEAD/);

  g("merge", "other"); // conflicts, on purpose
  const take = await call(server, "se_git", { args: ["checkout", "--theirs", "c.md"] });
  assert.equal(take.isError, false, JSON.stringify(take.body));
  // Line endings are git's business on Windows, not this test's.
  assert.equal(readFileSync(join(root, "c.md"), "utf8").trim(), "theirs", "the other side won, with no conflict block hand-edited");
});
