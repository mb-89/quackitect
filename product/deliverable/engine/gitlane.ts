// The git lane — allowlisted git through the engine, carried from v2 with
// its laws: no push — pushing is the owner's act (SE-C-003); no history
// rewrite (SE-C-002); allowlisted subcommands only (SE-C-004). Two v2
// guards stay OUT deliberately: the self-repo guard (v3 is self-hosted —
// the lane works on its own repo by design) and the commit window (a
// ledger-era law; v3 is pre-ledger).
import { spawnSync } from "node:child_process";
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
const ALLOWED = new Set(["status", "log", "diff", "show", "add", "commit", "fetch", "branch", "rev-parse", "restore", "merge"]);

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
  const r = git(cwd, ...args);
  return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
}
