// Expeditions — ad hoc work as git worktrees (the context-manager model):
// entering creates a worktree on its own branch, continuing binds the lane
// to it, and the CLOSE IS THE RULING (owner 2026-07-27): apply merges the
// changes to trunk, dismiss archives the branch unmerged. The worktree IS
// the record; the archive is git history (exp/* branches).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";
import { parseStateNote } from "./notes.ts";

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

/** The expedition's RECORD lives ON ITS BRANCH (owner ruling 2026-07-27:
 *  work state rides the worktree) at a spec path — so the merge lands
 *  closed records on the main tree as the browsable archive. */
export function recordRel(id: string): string {
  return `product/spec/expeditions/${id}/record.md`;
}

/** The record's frontmatter — from the worktree while open, from the
 *  branch once closed. Undefined for pre-record expeditions (e1–e3). */
export function readRecord(root: string, e: Expedition): Record<string, unknown> | undefined {
  const rel = recordRel(e.id);
  if (e.open) {
    const abs = join(e.path, rel);
    if (!existsSync(abs)) return undefined;
    return parseStateNote(readFileSync(abs, "utf8")).frontmatter;
  }
  // Closed: the record lives ON ITS BRANCH (owner ruling 2026-07-28 —
  // history is git's, the tree carries only live work). The close stamped
  // the ruling; the leave review IS the adjudication. A legacy merged
  // copy still reads.
  const merged = join(root, rel);
  if (existsSync(merged)) return parseStateNote(readFileSync(merged, "utf8")).frontmatter;
  const r = spawnSync("git", ["show", `${e.branch}:${rel}`], { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) return undefined;
  return parseStateNote(r.stdout).frontmatter;
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
  // NUMERIC order — git lists branches alphabetically (e1, e10, e11, …,
  // e2), which reads as missing entries to a human scanning for e10.
  return out.sort((a, b) => Number(a.id.match(/^e(\d+)/)?.[1] ?? 0) - Number(b.id.match(/^e(\d+)/)?.[1] ?? 0));
}

export function expNew(root: string, kind: string, goal: string): Expedition {
  const KINDS = ["spike", "fix", "explore"];
  if (!KINDS.includes(kind)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `kind: ${KINDS.join(" | ")}`,
      got: JSON.stringify(kind),
      remedy: { tool: "se_seed_expedition", args: { kind: "spike", goal }, note: "declare what kind of expedition this is" },
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
  // The engine's npm deps (ripgrep) do not ride a fresh worktree — without
  // them the lane's search and the selftests fail there.
  const deliverable = join(path, "product", "deliverable");
  if (existsSync(join(deliverable, "package.json")) && !existsSync(join(deliverable, "node_modules"))) {
    spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: deliverable, stdio: "ignore", shell: process.platform === "win32" });
  }
  // Mint the record WITH the expedition — committed, so the branch carries
  // it from the first moment. Frontmatter is the queryable surface; the
  // body is the human's, free prose.
  const recAbs = join(path, recordRel(id));
  mkdirSync(dirname(recAbs), { recursive: true });
  writeFileSync(
    recAbs,
    [
      "---",
      `id: ${id}`,
      `kind: ${kind}`,
      "status: open",
      `opened: ${new Date().toISOString()}`,
      `goal: ${JSON.stringify(goal)}`,
      "---",
      "",
      `# ${id}`,
      "",
      "Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.",
      "",
    ].join("\n"),
    "utf8",
  );
  git(path, ["add", "-A"], "add");
  git(path, ["commit", "-q", "-m", `expedition ${id}: open`], "commit");
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
      remedy: { tool: "se_tick", args: {}, note: "continue_expedition lists the open expeditions — entering one binds it" },
      source: SRC,
    });
  }
  return e;
}

/** Close IS the ruling: apply (merge=true) merges the changes to trunk;
 *  dismiss (merge=false) archives the branch unmerged. Leftovers are
 *  committed either way; the worktree is removed. */
export function expClose(root: string, e: Expedition, merge: boolean): { id: string; merged: boolean } {
  const recAbs = join(e.path, recordRel(e.id));
  if (existsSync(recAbs)) {
    // The expedition ends with a REPORT (owner ruling 2026-07-27); the
    // close ruling stamps it: applied (merged) or dismissed (unmerged).
    const repRel = `product/spec/expeditions/${e.id}/report.md`;
    if (!existsSync(join(e.path, repRel))) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a report before closing: ${repRel} — what was built or found, for the retro to adjudicate`,
        got: "no report.md in the expedition record",
        remedy: { tool: "se_file_write", args: { path: repRel, content: "<goal · what shipped or was found · open threads>", base_hash: null }, note: "write the report, then close again" },
        source: SRC,
      });
    }
    const raw = readFileSync(recAbs, "utf8");
    writeFileSync(recAbs, raw.replace(/^status: open$/m, `status: closed\nclosed: ${new Date().toISOString()}\nruling: ${merge ? "applied" : "dismissed"}`), "utf8");
  }
  // Leftover changes are committed — a walk's work never silently vanishes.
  const dirty = git(e.path, ["status", "--porcelain"], "status").trim() !== "";
  if (dirty) {
    git(e.path, ["add", "-A"], "add");
    git(e.path, ["commit", "-m", `expedition ${e.id}: close`], "commit");
  }
  if (merge) {
    // ATOMIC (hit live 2026-07-28): a conflicting merge left the root
    // mid-merge with markers inside main.canvas — the server died and the
    // relaunch refused on the red canvas. The close now aborts the failed
    // merge and refuses TYPED; the root tree is never left broken.
    const m = spawnSync("git", ["merge", "--no-ff", e.branch, "-m", `merge expedition ${e.id}`], { cwd: root, encoding: "utf8", windowsHide: true });
    if (m.status !== 0) {
      const conflicts = (spawnSync("git", ["diff", "--name-only", "--diff-filter=U"], { cwd: root, encoding: "utf8", windowsHide: true }).stdout ?? "").trim().replace(/\n/g, ", ");
      const aborted = spawnSync("git", ["merge", "--abort"], { cwd: root, windowsHide: true }).status === 0;
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the trunk merge of ${e.branch} to succeed`,
        got: `conflicts in: ${conflicts || "(unknown)"}${aborted ? " — the merge was aborted, the root tree stands clean" : " — and the abort failed too; run git merge --abort by hand"}`,
        remedy: { tool: "se_run", args: { command: "git merge <trunk-branch> --no-edit" }, note: "absorb trunk INTO the branch first: merge it in the worktree, resolve the named files there, commit, then close again" },
        source: SRC,
      });
    }
    // CLOSED RECORDS LIVE IN GIT (owner ruling 2026-07-28): history is
    // git's; the tree carries only live work. The record rode the merge —
    // retire its dir in the same breath; the branch keeps serving it.
    const dirRel = `product/spec/expeditions/${e.id}`;
    git(root, ["rm", "-r", "-q", "--ignore-unmatch", dirRel], "rm record");
    if (spawnSync("git", ["diff", "--cached", "--quiet", "--", dirRel], { cwd: root }).status === 1) {
      git(root, ["commit", "-q", "-m", `expedition ${e.id}: record retires to its branch`, "--", dirRel], "commit");
    }
  }
  git(root, ["worktree", "remove", "--force", e.path], "worktree remove");
  return { id: e.id, merged: merge };
}
