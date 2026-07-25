// The git layer. Two rules from the design doc (§16 "Bootstrap session"):
//   - Exercise this layer against throwaway fixture repos in tests.
//   - SE refuses to operate on the repo it was built from unless explicitly
//     flagged (a bug in worktree handling while developing inside that repo
//     would delete the working directory).
// And one from §4: SE never rebases or force-pushes a published branch.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Rejection } from "./errors.ts";
import { layout } from "./layout.ts";

export interface GitResult {
  ok: boolean;
  code: number;
  stdout: string;
  stderr: string;
}

/** Run a git command in a directory. Never throws on nonzero exit. */
export function git(cwd: string, ...args: string[]): GitResult {
  // windowsHide: every spawn in this engine sets it. Without it Windows flashes
  // a console window that STEALS FOCUS, which breaks the owner's voice dictation
  // mid-sentence. The board polls, so this one fires every couple of seconds.
  const r = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true });
  if (r.error) {
    return { ok: false, code: -1, stdout: "", stderr: String(r.error) };
  }
  return {
    ok: r.status === 0,
    code: r.status ?? -1,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? "").trim(),
  };
}

/** Repo toplevel for a path, or null when the path is not inside a work tree. */
export function repoRoot(path: string): string | null {
  if (!existsSync(path)) return null;
  const r = git(path, "rev-parse", "--show-toplevel");
  if (!r.ok) return null;
  return realpathSync(r.stdout);
}

/**
 * The repo SE itself was built from. Worktree-aware: compares the shared git
 * common dir, not the checkout path, so a linked worktree of the engine repo
 * is still recognized as self.
 */
export function engineCommonDir(): string | null {
  const engineDir = dirname(fileURLToPath(import.meta.url));
  return commonDir(engineDir);
}

/** The shared .git common dir for a path, or null. */
export function commonDir(path: string): string | null {
  if (!existsSync(path)) return null;
  const r = git(path, "rev-parse", "--git-common-dir");
  if (!r.ok) return null;
  // stdout may be relative (".git") or absolute (worktrees) — resolve handles both.
  return realpathSync(resolve(path, r.stdout));
}

/**
 * Guard for every state-changing git operation SE performs.
 * Refuses to operate on the repo SE was built from unless explicitly flagged.
 */
export function assertOperable(targetPath: string, opts: { allowSelf?: boolean } = {}): void {
  if (opts.allowSelf) return;
  const target = commonDir(targetPath);
  const self = engineCommonDir();
  if (target !== null && self !== null && target === self) {
    throw new Rejection({
      clause: "SE-C-001",
      expected: "a target repo that is not the repo SE was built from",
      got: `target shares SE's own git common dir: ${target}`,
      remedy: {
        tool: "se_git",
        args: { args: ["status"] },
        note: "SE refuses to operate on its own source repo; allow_self is an engine-level flag, not a tool argument",
      },
      source: "engine/git.ts assertOperable",
    });
  }
}

const commitWindowPath = (root: string): string => join(layout.seDir(root), "commit-window.json");

/** A gate bless opens the window; the next loop submit closes it. */
export function openCommitWindow(root: string, grantRef: string): void {
  mkdirSync(layout.seDir(root), { recursive: true });
  writeFileSync(commitWindowPath(root), JSON.stringify({ grant: grantRef, at: new Date().toISOString() }) + "\n", "utf8");
}

export function closeCommitWindow(root: string): void {
  rmSync(commitWindowPath(root), { force: true });
}

/** Commits are gate-bound: refused outside the bless window. */
export function assertCommitWindow(root: string): void {
  if (existsSync(commitWindowPath(root))) return;
  throw new Rejection({
    clause: "SE-C-047",
    expected: "a commit inside the bless window (gate bless -> next loop submit)",
    got: "no open window",
    remedy: {
      tool: "se_loop_next",
      args: {},
      note: "reach and pass the next gate, then commit; an explicit owner grant is the emergency escape",
    },
    source: "engine/git.ts assertCommitWindow",
  });
}

/** Refuse destructive history rewrites on published branches (§4). */
export function assertNotHistoryRewrite(args: string[]): void {
  const joined = args.join(" ");
  const banned =
    args[0] === "rebase" ||
    (args[0] === "push" && (args.includes("--force") || args.includes("-f") || joined.includes("--force-with-lease")));
  if (banned) {
    throw new Rejection({
      clause: "SE-C-002",
      expected: "no rebase or force-push — superseded ledger content lives in history",
      got: `git ${joined}`,
      remedy: {
        tool: "se_git",
        args: { args: ["status"] },
        note: "history rewrites are refused outright; if the branch diverged, reconcile by merge",
      },
      source: "engine/git.ts assertNotHistoryRewrite",
    });
  }
}

/**
 * se.rule-owner-pushes: the agent never pushes to origin — pushing is an
 * owner act. The agent lane refuses every push (SE-C-003); the owner pushes
 * from their own console.
 */
export function assertNotPush(args: string[]): void {
  if (args[0] === "push") {
    throw new Rejection({
      clause: "SE-C-003",
      expected: "no push on the agent lane — pushing is an owner act (se.rule-owner-pushes)",
      got: `git ${args.join(" ")}`,
      remedy: {
        tool: "se_git",
        args: { args: ["log", "--oneline", "@{upstream}.."] },
        note: "commit locally and list what is ahead; the owner pushes when they choose",
      },
      source: "engine/git.ts assertNotPush",
    });
  }
}
