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

// see dsp-file-lane.md#merge-is-allowed
const ALLOWED = new Set(["status", "log", "diff", "show", "add", "commit", "fetch", "branch", "rev-parse", "restore", "merge", "checkout"]);

export function gitLane(cwd: string, rawArgs: unknown[]): Record<string, unknown> {
  const args = rawArgs.map(String);
  if (args[0] === "push") {
    throw new Rejection({
      clause: CLAUSES.GIT_PUSH,
      expected: "no push on the agent lane — pushing is the owner's act",
      got: `git ${args.join(" ")}`,
      remedy: {
        tool: "se_git",
        args: { args: ["log", "--oneline", "-10"] },
        note: "commit locally and list what is ahead; the owner pushes when they choose",
      },
      source: "engine/gitlane.ts",
    });
  }
  if (args[0] === "rebase") {
    throw new Rejection({
      clause: CLAUSES.GIT_REWRITE,
      expected: "no rebase — superseded content lives in history",
      got: `git ${args.join(" ")}`,
      remedy: {
        tool: "se_git",
        args: { args: ["status"] },
        note: "history rewrites are refused outright; a diverged branch reconciles by merge",
      },
      source: "engine/gitlane.ts",
    });
  }
  if (!ALLOWED.has(args[0] ?? "")) {
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: `an allowlisted git subcommand (${[...ALLOWED].join(", ")})`,
      got: args[0] ?? "(none)",
      remedy: {
        tool: "se_git",
        args: { args: ["status"] },
        note: "destructive git stays engine-internal; note the gap if a lane is missing",
      },
      source: "engine/gitlane.ts",
    });
  }
  // restore un-stages only: without --staged it would discard human edits.
  if (args[0] === "restore" && !args.includes("--staged")) {
    throw new Rejection({
      clause: CLAUSES.GIT_NOT_ALLOWLISTED,
      expected: "restore with --staged (unstage only)",
      got: `git ${args.join(" ")}`,
      remedy: {
        tool: "se_git",
        args: { args: ["restore", "--staged", "<path>"] },
        note: "a restore discards human edits; only unstaging is lane-legal",
      },
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
        remedy: {
          tool: "se_git",
          args: { args: ["checkout", "--theirs", "<path>"] },
          note: "a bare checkout switches branches or discards edits; only taking one side of a CONFLICTED file is legal",
        },
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
        remedy: {
          tool: "se_git",
          args: { args: ["status"] },
          note: "outside a merge this discards working-tree edits, which the lane never does",
        },
        source: "engine/gitlane.ts",
      });
    }
  }
  const r = git(cwd, ...args);
  return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
}

/** see dsp-file-lane.md#the-engines-own-trail-is-not-somebodys-uncommitted-work */
const ENGINE_TRAIL = /^spec\/(?:expeditions|iterations)\/[^/]+\/decisions\.jsonl$/;

export function dirtyLines(porcelain: string): string[] {
  return (
    porcelain
      .split("\n")
      .filter((l) => l !== "")
      // see dsp-file-lane.md#untracked-files-do-not-block-a-reconcile
      .filter((l) => !l.startsWith("??"))
      .filter((l) => !ENGINE_TRAIL.test(l.slice(2).trim().replace(/\\/g, "/").replace(/^"|"$/g, "")))
  );
}

function _refuseDirty(where: string, tree: string, what: string): void {
  const dirty = dirtyLines(git(where, "status", "--porcelain").stdout);
  if (dirty.length === 0) return;
  throw new Rejection({
    clause: CLAUSES.GIT_NOT_ALLOWLISTED,
    expected: `a clean ${tree} to ${what}`,
    got: `${dirty.length} uncommitted change(s) on ${tree}: ${dirty.slice(0, 5).join(", ")}`,
    remedy: {
      tool: "se_git",
      args: { args: ["status", "--porcelain"] },
      note: "commit what is there first; reconciling must never bury somebody's uncommitted work",
    },
    source: "engine/gitlane.ts",
  });
}

function _crossed(where: string, before: string): string[] {
  const after = git(where, "rev-parse", "HEAD").stdout;
  if (before === after) return [];
  return git(where, "log", "--oneline", `${before}..${after}`)
    .stdout.split("\n")
    .filter((l) => l !== "");
}

// see dsp-file-lane.md#one-tree-needs-no-reconciliation
