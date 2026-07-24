// The worktree lane (i5, E1): iterations run in isolated worktrees on their
// own branches and reunify honestly at ship. Home and naming per
// adr-worktree-home-inrepo; nothing here deletes an abandoned tree.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Rejection } from "./errors.ts";
import { assertOperable, git } from "./git.ts";
import { layout } from "./layout.ts";
import { readJsonFile } from "./jsonio.ts";
import { parseNode, serializeNode } from "./node.ts";

const GIT_ID = ["-c", "user.email=se@local", "-c", "user.name=se"];

const SRC = "engine/worktree.ts";

export const worktreeHome = (root: string): string => join(root, ".worktrees");
export const worktreePath = (root: string, iteration: string): string => join(worktreeHome(root), iteration);
export const branchName = (iteration: string): string => `iter/${iteration}`;

export interface WorktreeRef {
  iteration: string;
  root: string;
  branch: string;
  adopted: boolean;
}

/** The trunk .gitignore carries the home — or git add sweeps trees in. */
function ensureIgnored(root: string): void {
  const path = join(root, ".gitignore");
  const entry = ".worktrees/";
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (current.split(/\r?\n/).some((l) => l.trim() === entry)) return;
  appendFileSync(path, (current.endsWith("\n") || current === "" ? "" : "\n") + entry + "\n", "utf8");
}

/** Provision the iteration's worktree and branch; leftovers are ADOPTED. */
export function provisionWorktree(root: string, iteration: string, opts: { allowSelf?: boolean } = {}): WorktreeRef {
  assertOperable(root, opts);
  ensureIgnored(root);
  const wt = worktreePath(root, iteration);
  const branch = branchName(iteration);
  if (existsSync(wt)) {
    return { iteration, root: wt, branch, adopted: true };
  }
  const branchExists = git(root, "branch", "--list", branch).stdout !== "";
  const r = branchExists
    ? git(root, "worktree", "add", wt, branch)
    : git(root, "worktree", "add", wt, "-b", branch);
  if (!r.ok) {
    throw new Rejection({
      clause: "SE-C-074",
      expected: `a provisionable worktree for ${iteration}`,
      got: r.stderr.slice(0, 300),
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "inspect the tree state; a locked or dirty leftover needs a human" },
      source: SRC,
    });
  }
  return { iteration, root: wt, branch, adopted: false };
}

/** Ship removes the tree (branch stays for history); abandon FLAGS, never deletes. */
export function retireWorktree(root: string, iteration: string, mode: "ship" | "abandon", opts: { allowSelf?: boolean } = {}): void {
  assertOperable(root, opts);
  const wt = worktreePath(root, iteration);
  if (!existsSync(wt)) return;
  if (mode === "abandon") {
    writeFileSync(join(wt, ".abandoned"), new Date().toISOString() + "\n", "utf8");
    return;
  }
  const r = git(root, "worktree", "remove", "--force", wt);
  if (!r.ok) {
    // Removal failure is flagged, never forced further (the debris invariant).
    writeFileSync(join(wt, ".retire-failed"), r.stderr.slice(0, 300) + "\n", "utf8");
  }
}

/** Every LIVE stream: a homed worktree that is not flagged abandoned. */
export function openWorktrees(root: string): { iteration: string; root: string; branch: string }[] {
  const home = worktreeHome(root);
  if (!existsSync(home)) return [];
  void home;
  const out: { iteration: string; root: string; branch: string }[] = [];
  const list = git(root, "worktree", "list", "--porcelain").stdout;
  for (const block of list.split("\n\n")) {
    const dir = block.match(/^worktree (.+)$/m)?.[1];
    if (dir === undefined) continue;
    // Ours iff its parent directory is the .worktrees home (slash-agnostic).
    const segs = dir.split(/[\\/]/);
    if (segs[segs.length - 2] !== ".worktrees") continue;
    if (existsSync(join(dir, ".abandoned"))) continue;
    const iteration = segs[segs.length - 1];
    out.push({ iteration, root: dir, branch: block.match(/^branch refs\/heads\/(.+)$/m)?.[1] ?? branchName(iteration) });
  }
  return out;
}

export interface ShipMergeResult {
  merged: boolean;
  conflict?: string;
  suspects: string[];
}

/** Append-only ledger events (grants) union-merge — two iterations closing
 *  both append, and a conflict there would block every honest parallel ship. */
function ensureGitAttributes(root: string): boolean {
  const path = join(root, ".gitattributes");
  const line = "product/spec/iterations/grants.jsonl merge=union";
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (current.split(/\r?\n/).some((l) => l.trim() === line)) return false;
  appendFileSync(path, (current.endsWith("\n") || current === "" ? "" : "\n") + line + "\n", "utf8");
  return true;
}

/** The suspect mark (adr-suspect-frontmatter): a frontmatter field, canonical. */
function markSuspect(abs: string, rel: string, branch: string): void {
  const node = parseNode(readFileSync(abs, "utf8"), rel);
  node.extra = { ...node.extra, suspect: `changed on both lines; merged from ${branch}` };
  writeFileSync(abs, serializeNode(node), "utf8");
}

/**
 * Ship (E4+E5): merge the iteration branch to trunk; mark every ledger node
 * changed on BOTH lines suspect; a textual conflict STOPS and aborts; the
 * shipped tree retires. The branch stays for history.
 */
export function shipMerge(root: string, iteration: string, opts: { allowSelf?: boolean } = {}): ShipMergeResult {
  assertOperable(root, opts);
  const branch = branchName(iteration);
  const trunk = git(root, "rev-parse", "--abbrev-ref", "HEAD").stdout;
  if (ensureGitAttributes(root)) {
    git(root, "add", "--", ".gitattributes");
    git(root, ...GIT_ID, "commit", "-m", "grants.jsonl union-merges (honest parallel ship)");
  }
  const base = git(root, "merge-base", trunk, branch).stdout;
  const branchFiles = new Set(git(root, "diff", "--name-only", base, branch).stdout.split("\n").filter(Boolean));
  const trunkFiles = git(root, "diff", "--name-only", base, trunk).stdout.split("\n").filter(Boolean);
  const ledgerRel = layout.ledger(root).slice(root.length + 1).replaceAll("\\", "/");
  const overlap = trunkFiles.filter((f) => branchFiles.has(f));
  const overlapLedger = overlap.filter((f) => f.startsWith(ledgerRel) && f.endsWith(".md"));

  const m = git(root, ...GIT_ID, "merge", "--no-edit", branch);
  if (!m.ok) {
    const conflicted = git(root, "diff", "--name-only", "--diff-filter=U").stdout.split("\n").filter(Boolean);
    git(root, "merge", "--abort");
    return { merged: false, conflict: (conflicted.join(", ") || m.stderr).slice(0, 300), suspects: [] };
  }

  const suspects: string[] = [];
  for (const rel of overlapLedger) {
    const abs = join(root, rel);
    if (!existsSync(abs)) continue; // deleted on one side — not a content overlap
    markSuspect(abs, rel, branch);
    suspects.push(rel);
  }
  if (suspects.length > 0) {
    git(root, "add", "--", ...suspects);
    git(root, ...GIT_ID, "commit", "-m", `suspects marked after merging ${branch}`);
  }
  retireWorktree(root, iteration, "ship", opts);
  return { merged: true, suspects };
}

/** depends_on is satisfied only by a gate_release grant (adr-shipped-is-release-grant). */
export function assertDependsMet(root: string, iteration: string): void {
  const planPath = layout.planPath(root);
  if (!existsSync(planPath)) return;
  const plan = readJsonFile<{ iterations?: { id: string; depends_on?: string[] }[] }>(planPath);
  const entry = plan.iterations?.find((it) => it.id === iteration);
  if (entry?.depends_on === undefined || entry.depends_on.length === 0) return;
  const shipped = new Set<string>();
  if (existsSync(layout.grantsPath(root))) {
    for (const line of readFileSync(layout.grantsPath(root), "utf8").split("\n")) {
      if (line.trim() === "") continue;
      try {
        const g = JSON.parse(line) as { iteration?: string; state?: string };
        if (g.state === "gate_release" && g.iteration !== undefined) shipped.add(g.iteration);
      } catch {
        continue;
      }
    }
  }
  const unmet = entry.depends_on.filter((d) => !shipped.has(d));
  if (unmet.length > 0) {
    throw new Rejection({
      clause: "SE-C-072",
      expected: `every dependency shipped (gate_release grant present) before ${iteration} starts`,
      got: `unshipped: ${unmet.join(", ")}`,
      remedy: { tool: "se_loop_next", args: {}, note: "ship the dependency first; independent iterations may open concurrently" },
      source: SRC,
    });
  }
}
