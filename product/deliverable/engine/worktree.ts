// Expeditions — ad hoc work as git worktrees (the context-manager model):
// entering creates a worktree on its own branch, continuing binds the lane
// to it, leaving merges back (until iterations exist to receive the
// changes as design input). The worktree IS the record; the archive is
// git history (merged exp/* branches).
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";

const SRC = "engine/worktree.ts";

function git(root: string, args: string[], what: string): string {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Rejection({
      clause: CLAUSES.NOT_CONFIGURED,
      expected: `git ${what} to succeed`,
      got: (r.stderr ?? "").trim().slice(0, 500) || `exit ${r.status}`,
      remedy: { tool: "se_run", args: { command: "git status" }, note: "inspect the repository state" },
      source: SRC,
    });
  }
  return r.stdout ?? "";
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "work";
}

export interface Expedition {
  id: string;
  branch: string;
  path: string;
  open: boolean;
}

export function worktreesDir(root: string): string {
  return join(root, ".worktrees");
}

/** Open = the worktree exists. Closed (archive) = branch exp/* without one. */
export function expList(root: string): Expedition[] {
  const out: Expedition[] = [];
  const branches = git(root, ["branch", "--list", "exp/*", "--format=%(refname:short)"], "branch --list")
    .split("\n")
    .map((b) => b.trim())
    .filter((b) => b !== "");
  for (const branch of branches) {
    const id = branch.slice("exp/".length);
    const path = join(worktreesDir(root), id);
    out.push({ id, branch, path, open: existsSync(path) });
  }
  return out;
}

export function expNew(root: string, kind: string, goal: string): Expedition {
  const KINDS = ["spike", "fix", "explore"];
  if (!KINDS.includes(kind)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `kind: ${KINDS.join(" | ")}`,
      got: JSON.stringify(kind),
      remedy: { tool: "se_exp_new", args: { kind: "spike", goal }, note: "declare what kind of expedition this is" },
      source: SRC,
    });
  }
  const n = expList(root).reduce((max, e) => {
    const m = e.id.match(/^e(\d+)-/);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0) + 1;
  const id = `e${n}-${kind}-${slug(goal)}`;
  const path = join(worktreesDir(root), id);
  mkdirSync(worktreesDir(root), { recursive: true });
  git(root, ["worktree", "add", path, "-b", `exp/${id}`], "worktree add");
  return { id, branch: `exp/${id}`, path, open: true };
}

export function expFind(root: string, id: string): Expedition {
  const e = expList(root).find((x) => x.id === id);
  if (e === undefined || !e.open) {
    const open = expList(root).filter((x) => x.open).map((x) => x.id);
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `an OPEN expedition: ${open.join(", ") || "(none — start one first)"}`,
      got: id,
      remedy: { tool: "se_exp_list", args: {}, note: "list the expeditions, then open one by id" },
      source: SRC,
    });
  }
  return e;
}

/** Close: commit leftovers, merge back (the bootstrap default until
 *  iterations exist), remove the worktree. Keep merge=false to archive
 *  the branch unmerged. */
export function expClose(root: string, e: Expedition, merge: boolean): { id: string; merged: boolean } {
  // Leftover changes are committed — a walk's work never silently vanishes.
  const dirty = git(e.path, ["status", "--porcelain"], "status").trim() !== "";
  if (dirty) {
    git(e.path, ["add", "-A"], "add");
    git(e.path, ["commit", "-m", `expedition ${e.id}: close`], "commit");
  }
  if (merge) git(root, ["merge", "--no-ff", e.branch, "-m", `merge expedition ${e.id}`], "merge");
  git(root, ["worktree", "remove", "--force", e.path], "worktree remove");
  return { id: e.id, merged: merge };
}
