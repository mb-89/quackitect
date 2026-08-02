// The git lane — allowlisted git through the engine, carried from v2 with
// its laws: no push — pushing is the owner's act (SE-C-003); no history
// rewrite (SE-C-002); allowlisted subcommands only (SE-C-004). Two v2
// guards stay OUT deliberately: the self-repo guard (v3 is self-hosted —
// the lane works on its own repo by design) and the commit window (a
// ledger-era law; v3 is pre-ledger).
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

export interface GitResult {
  ok: boolean;
  code: number;
  stdout: string;
  stderr: string;
}

/** Run git in a directory. Never throws on nonzero exit. windowsHide: a
 *  flashing console window steals focus mid-dictation. */
export function git(cwd: string, ...args: string[]): GitResult {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true });
  if (r.error) return { ok: false, code: -1, stdout: "", stderr: String(r.error) };
  return { ok: r.status === 0, code: r.status ?? -1, stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}

// MERGE IS ALLOWED, REBASE IS NOT (owner ruling 2026-07-29). The asymmetry
// is history: a rebase rewrites it, a merge only adds a commit that can be
// reverted. The rebase refusal below already named merge as its remedy while
// the allowlist forbade it, so the lane pointed at a door it had locked.
// TAKING ONE SIDE OF A CONFLICT (gap hit live 2026-07-30, e26). Merging was
// allowed but RESOLVING it was not, so seventeen conflict blocks across four
// files had to be hand-edited through the agent's context. checkout joins the
// list in ONE form: --ours or --theirs, on a named path, while a merge is
// actually in progress. That rewrites a file the merge has already broken,
// and nothing else.
const ALLOWED = new Set(["status", "log", "diff", "show", "add", "commit", "fetch", "branch", "rev-parse", "restore", "merge", "checkout"]);

export function gitLane(cwd: string, rawArgs: unknown[]): Record<string, unknown> {
  const args = rawArgs.map(String);
  if (args[0] === "push") {
    throw new Rejection({
      clause: CLAUSES.GIT_PUSH,
      expected: "no push on the agent lane — pushing is the owner's act",
      got: `git ${args.join(" ")}`,
      remedy: { tool: "se_git", args: { args: ["log", "--oneline", "-10"] }, note: "commit locally and list what is ahead; the owner pushes when they choose" },
      source: "engine/gitlane.ts",
    });
  }
  if (args[0] === "rebase") {
    throw new Rejection({
      clause: CLAUSES.GIT_REWRITE,
      expected: "no rebase — superseded content lives in history",
      got: `git ${args.join(" ")}`,
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "history rewrites are refused outright; a diverged branch reconciles by merge" },
      source: "engine/gitlane.ts",
    });
  }
  if (!ALLOWED.has(args[0] ?? "")) {
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: `an allowlisted git subcommand (${[...ALLOWED].join(", ")})`,
      got: args[0] ?? "(none)",
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "destructive git stays engine-internal; note the gap if a lane is missing" },
      source: "engine/gitlane.ts",
    });
  }
  // restore un-stages only: without --staged it would discard human edits.
  if (args[0] === "restore" && !args.includes("--staged")) {
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: "restore with --staged (unstage only)",
      got: `git ${args.join(" ")}`,
      remedy: { tool: "se_git", args: { args: ["restore", "--staged", "<path>"] }, note: "worktree restores discard human edits; only unstaging is lane-legal" },
      source: "engine/gitlane.ts",
    });
  }
  if (args[0] === "checkout") {
    const side = args.includes("--ours") || args.includes("--theirs");
    const paths = args.slice(1).filter((a) => !a.startsWith("-"));
    if (!side || paths.length === 0) {
      throw new Rejection({
        clause: CLAUSES.GIT_NOT_ALLOWLISTED,
        expected: "checkout --ours <path> or checkout --theirs <path> — the only lane-legal checkout",
        got: `git ${args.join(" ")}`,
        remedy: { tool: "se_git", args: { args: ["checkout", "--theirs", "<path>"] }, note: "a bare checkout switches branches or discards edits; only taking one side of a CONFLICTED file is legal" },
        source: "engine/gitlane.ts",
      });
    }
    // Outside a merge there are no sides, and the same command would throw
    // away working-tree edits instead. The lane never does that.
    if (!git(cwd, "rev-parse", "-q", "--verify", "MERGE_HEAD").ok) {
      throw new Rejection({
        clause: CLAUSES.GIT_NOT_ALLOWLISTED,
        expected: "a merge in progress — taking a side only means something mid-conflict",
        got: "no MERGE_HEAD",
        remedy: { tool: "se_git", args: { args: ["status"] }, note: "outside a merge this discards working-tree edits, which the lane never does" },
        source: "engine/gitlane.ts",
      });
    }
  }
  const r = git(cwd, ...args);
  return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
}

// THE TWO TREES DRIFT, AND THE LANE COULD NOT CLOSE THE GAP. An expedition's
// branch is cut when it is SEEDED, so a worktree is behind before it is ever
// entered. An expedition that stays open on purpose still has to get its work
// onto trunk. Both directions were done with `git -C <absolute root>` through
// se_run, which is a shell command doing a lane tool's job and a hole straight
// through contract rule 1. Hit at e20, at e21, and four times in one day.
//
// The pair is deliberate. SYNC brings trunk IN so a worktree is never silently
// stale. LAND puts the work OUT without closing anything. Close stays the
// third thing, and it is the only one that retires a record.
function twoTrees(root: string, worktree: string, verb: string): { branch: string; trunk: string } {
  if (resolve(root) === resolve(worktree)) {
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: "a bound expedition — this reconciles a worktree WITH trunk",
      got: `${verb} with nothing bound`,
      remedy: { tool: "se_pull", args: {}, note: "enter an expedition first; at the root there are not two trees to reconcile" },
      source: "engine/gitlane.ts",
    });
  }
  return {
    branch: git(worktree, "rev-parse", "--abbrev-ref", "HEAD").stdout,
    trunk: git(root, "rev-parse", "--abbrev-ref", "HEAD").stdout,
  };
}

/** THE ENGINE'S OWN TRAIL IS NOT SOMEBODY'S UNCOMMITTED WORK. A narrated call
 *  writes the record's decisions.jsonl into the bound worktree, so a walk can
 *  never present a clean tree while it is narrating — and a sync is wanted
 *  exactly when an expedition is entered, which is when narration is heaviest.
 *  The two mechanisms refused each other: riding an update on the sync dirtied
 *  the tree before it checked, so it refused itself (found live 2026-08-02).
 *
 *  Only the trail is excused. A reconcile must still never bury real work. */
const ENGINE_TRAIL = /product\/spec\/(?:expeditions|iterations)\/[^/]+\/decisions\.jsonl$/;

export function dirtyLines(porcelain: string): string[] {
  return porcelain
    .split("\n")
    .filter((l) => l !== "")
    .filter((l) => !ENGINE_TRAIL.test(l.slice(2).trim().replace(/\\/g, "/").replace(/^"|"$/g, "")));
}

function refuseDirty(where: string, tree: string, what: string): void {
  const dirty = dirtyLines(git(where, "status", "--porcelain").stdout);
  if (dirty.length === 0) return;
  throw new Rejection({
    clause: CLAUSES.GIT_NOT_ALLOWLISTED,
    expected: `a clean ${tree} to ${what}`,
    got: `${dirty.length} uncommitted change(s) on ${tree}: ${dirty.slice(0, 5).join(", ")}`,
    remedy: { tool: "se_git", args: { args: ["status", "--porcelain"] }, note: "commit what is there first; reconciling must never bury somebody's uncommitted work" },
    source: "engine/gitlane.ts",
  });
}

function crossed(where: string, before: string): string[] {
  const after = git(where, "rev-parse", "HEAD").stdout;
  if (before === after) return [];
  return git(where, "log", "--oneline", `${before}..${after}`).stdout.split("\n").filter((l) => l !== "");
}

/** LAND the bound expedition's commits on trunk, and LEAVE IT OPEN. */
export function gitLand(root: string, worktree: string): Record<string, unknown> {
  const { branch, trunk } = twoTrees(root, worktree, "land");
  refuseDirty(root, trunk, "land on");
  const before = git(root, "rev-parse", "HEAD").stdout;
  let how = "fast-forward";
  if (!git(root, "merge", "--ff-only", branch).ok) {
    how = "merge";
    const m = git(root, "merge", "--no-edit", branch);
    if (!m.ok) {
      git(root, "merge", "--abort");
      throw new Rejection({
        clause: CLAUSES.GIT_NOT_ALLOWLISTED,
        expected: `${branch} to land on ${trunk} cleanly`,
        got: (m.stdout || m.stderr).split("\n").slice(0, 6).join(" · "),
        remedy: { tool: "se_git_sync", args: {}, note: "the merge was ABORTED and nothing changed — sync trunk into the expedition, settle it there, then land again" },
        source: "engine/gitlane.ts",
      });
    }
  }
  const commits = crossed(root, before);
  return { landed: commits.length, how: commits.length === 0 ? "already there" : how, from: branch, onto: trunk, commits, still_open: true };
}

/** SYNC trunk INTO the bound expedition, so the worktree is never stale. */
export function gitSync(root: string, worktree: string): Record<string, unknown> {
  const { branch, trunk } = twoTrees(root, worktree, "sync");
  refuseDirty(worktree, branch, "sync into");
  const before = git(worktree, "rev-parse", "HEAD").stdout;
  const m = git(worktree, "merge", "--no-edit", trunk);
  if (!m.ok) {
    git(worktree, "merge", "--abort");
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: `${trunk} to merge into ${branch} cleanly`,
      got: (m.stdout || m.stderr).split("\n").slice(0, 6).join(" · "),
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "the merge was ABORTED and nothing changed — settle the overlap by hand, then sync again" },
      source: "engine/gitlane.ts",
    });
  }
  const commits = crossed(worktree, before);
  return { received: commits.length, from: trunk, into: branch, commits };
}
