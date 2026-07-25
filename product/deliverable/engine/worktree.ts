// The worktree lane (i5, E1): iterations run in isolated worktrees on their
// own branches and reunify honestly at ship. Home and naming per
// adr-worktree-home-inrepo; nothing here deletes an abandoned tree.
//
// The close is a SPLIT (i5d): milestone commits land on the branch, and closing
// merges only live claims to trunk while the record stays reachable through a
// mandatory tag. Ordering is load-bearing — see adr-tag-before-merge.
import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
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
export const iterationTag = (iteration: string): string => `iter/${iteration}`;

/**
 * The PROJECT root for a root that may itself be a worktree. A caller rooted
 * inside .worktrees/<id> is still working on the project two levels up, and
 * mistaking one for the other makes a worktree-resident iteration look
 * trunk-resident — which silently skips its milestone commits.
 */
export function projectRootOf(root: string): string {
  const abs = resolve(root);
  return basename(dirname(abs)) === ".worktrees" ? resolve(abs, "..", "..") : abs;
}

export interface WorktreeRef {
  iteration: string;
  root: string;
  branch: string;
  adopted: boolean;
  warnings?: string[];
}

/** The trunk .gitignore carries the home — or git add sweeps trees in. */
function ensureIgnored(root: string): void {
  const path = join(root, ".gitignore");
  const entry = ".worktrees/";
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (current.split(/\r?\n/).some((l) => l.trim() === entry)) return;
  appendFileSync(path, (current.endsWith("\n") || current === "" ? "" : "\n") + entry + "\n", "utf8");
}

/** The iterations home as a repo-relative posix prefix, derived from the layout. */
const ITER_HOME_REL = layout
  .iterations("")
  .split(/[\\/]/)
  .filter(Boolean)
  .join("/");

/**
 * Is this repo-relative path one of the iteration's EVENTS — the record of how
 * it got there — rather than a live claim? Events stay on the branch at close
 * (adr-event-classification-by-path). The grant index and the plan are claims:
 * they live beside the iterations but describe the project, not one iteration.
 */
export function isEventPath(rel: string, iteration: string): boolean {
  const p = rel.replaceAll("\\", "/").replace(/^\.\//, "");
  const home = `${ITER_HOME_REL}/${iteration}/`;
  if (!p.startsWith(home)) return false;
  const tail = p.slice(home.length);
  return tail.startsWith("evidence/") || tail.startsWith("machines/") || tail === "state.json" || tail.startsWith("sub-");
}

/**
 * The verify toolchain must resolve from inside a fresh worktree, or its first
 * battery dies at tsc. It is INSTALLED, never linked: a link into a shared
 * install is a path a later removal can follow and destroy, which is the same
 * failure se.law-imports-are-read-only exists to prevent. The dependency set is
 * tiny, so a real install costs seconds.
 */
function ensureToolchain(wtRoot: string): void {
  const dir = layout.deliverable(wtRoot);
  if (!existsSync(join(dir, "package.json")) || existsSync(join(dir, "node_modules"))) return;
  spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: dir, encoding: "utf8", shell: true });
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
  const warnings: string[] = [];
  ensureToolchain(wt);
  if (!existsSync(join(layout.deliverable(wt), "node_modules"))) {
    warnings.push("the verify toolchain is not resolvable from this worktree — run the install before the first battery");
  }
  // A fork taken while trunk carries uncommitted engine changes does NOT match
  // the engine that is running, which cost i8c two failed batteries.
  const dirty = git(root, "status", "--porcelain", "--", layout.deliverable(root));
  if (dirty.ok && dirty.stdout.trim() !== "") {
    warnings.push("trunk carries uncommitted deliverable changes — this worktree forks from a state that does not match the running engine");
  }
  return { iteration, root: wt, branch, adopted: false, ...(warnings.length > 0 ? { warnings } : {}) };
}

export interface MilestoneResult {
  committed: boolean;
  sha?: string;
}

/**
 * Fix an iteration's state onto ITS OWN branch. Driven against the worktree
 * explicitly, never the caller's cwd — a bless arriving from the board is a
 * trunk-rooted process, and trusting its cwd would commit trunk to trunk.
 */
export function commitMilestone(
  root: string,
  iteration: string,
  message: string,
  opts: { allowSelf?: boolean } = {},
): MilestoneResult {
  assertOperable(root, opts);
  const wt = worktreePath(root, iteration);
  if (!existsSync(wt)) return { committed: false };
  const status = git(wt, "status", "--porcelain");
  if (!status.ok || status.stdout.trim() === "") return { committed: false }; // nothing to commit is legal
  if (!git(wt, "add", "-A").ok) return { committed: false };
  const c = git(wt, ...GIT_ID, "commit", "-m", message);
  if (!c.ok) return { committed: false };
  return { committed: true, sha: git(wt, "rev-parse", "HEAD").stdout };
}

/**
 * The linked toolchain must be unlinked BEFORE the tree is removed. Windows
 * removals follow a directory junction and delete THROUGH it — witnessed once,
 * where retiring a worktree emptied trunk's shared install.
 */
function unlinkToolchain(wtRoot: string): void {
  const dst = join(layout.deliverable(wtRoot), "node_modules");
  try {
    if (!existsSync(dst) || !lstatSync(dst).isSymbolicLink()) return;
    rmdirSync(dst); // removes the link itself, never its target
  } catch {
    // Best-effort: a stuck link is reported by the removal that follows.
  }
}

/** Ship removes the tree (branch and tag stay for history); abandon FLAGS, never deletes. */
export function retireWorktree(root: string, iteration: string, mode: "ship" | "abandon", opts: { allowSelf?: boolean } = {}): void {
  assertOperable(root, opts);
  const wt = worktreePath(root, iteration);
  if (!existsSync(wt)) return;
  unlinkToolchain(wt);
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
  // Read the .worktrees home from the filesystem — NO git subprocess. The board
  // polls this every tick; spawning git each time flashes a console and churns
  // CPU. Provisioning names each tree .worktrees/<iteration> on iter/<iteration>.
  const out: { iteration: string; root: string; branch: string }[] = [];
  for (const entry of readdirSync(home, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const wtRoot = join(home, entry.name);
    if (existsSync(join(wtRoot, ".abandoned"))) continue;
    out.push({ iteration: entry.name, root: wtRoot, branch: branchName(entry.name) });
  }
  return out;
}

export interface ShipMergeResult {
  merged: boolean;
  /** Why the close declined to touch trunk at all. */
  refused?: string;
  conflict?: string;
  suspects: string[];
  tag?: string;
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

/** Withholding the files must not leave their empty shells behind on trunk. */
function pruneEmptyDirs(dir: string): void {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) pruneEmptyDirs(join(dir, e.name));
  }
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
}

/** The suspect mark (adr-suspect-frontmatter): a frontmatter field, canonical. */
function markSuspect(abs: string, rel: string, branch: string): void {
  const node = parseNode(readFileSync(abs, "utf8"), rel);
  node.extra = { ...node.extra, suspect: `changed on both lines; merged from ${branch}` };
  writeFileSync(abs, serializeNode(node), "utf8");
}

/**
 * The close: merge the iteration's LIVE CLAIMS to trunk, leave its record on the
 * branch under a mandatory tag, and refuse rather than half-apply.
 *
 * Order is the guarantee (adr-tag-before-merge): emptiness, then the tag, then
 * the merge. Every refusal happens before trunk's single visible write, so a
 * failed close leaves HEAD exactly where it was.
 */
export function shipMerge(root: string, iteration: string, opts: { allowSelf?: boolean } = {}): ShipMergeResult {
  assertOperable(root, opts);
  const branch = branchName(iteration);
  const tag = iterationTag(iteration);
  const trunk = git(root, "rev-parse", "--abbrev-ref", "HEAD").stdout;

  const base = git(root, "merge-base", trunk, branch).stdout;
  if (base === "") {
    return { merged: false, refused: `no common ancestor between ${trunk} and ${branch}`, suspects: [] };
  }
  // A branch with nothing on it must never close as a success (the i8c defect).
  const ahead = git(root, "rev-list", "--count", `${base}..${branch}`).stdout;
  if (ahead === "" || Number(ahead) === 0) {
    return { merged: false, refused: `${branch} carries no commits — nothing to ship`, suspects: [] };
  }
  // Name the record BEFORE any of it leaves the tree.
  if (git(root, "rev-parse", "-q", "--verify", `refs/tags/${tag}`).ok) {
    return { merged: false, refused: `the tag ${tag} already exists — the record cannot be named`, suspects: [] };
  }
  if (!git(root, "tag", tag, branch).ok) {
    return { merged: false, refused: `the tag ${tag} could not be created`, suspects: [] };
  }

  // The union-merge attribute must be in the tree BEFORE the merge to take
  // effect on grants.jsonl — but committing it separately would move trunk's
  // HEAD before the refusal paths are past, so it rides the close's own commit
  // and any refusal puts the file back exactly as it was.
  const attrPath = join(root, ".gitattributes");
  const attrBefore = existsSync(attrPath) ? readFileSync(attrPath, "utf8") : null;
  const attrWritten = ensureGitAttributes(root);
  const undoClose = (): void => {
    git(root, "tag", "-d", tag); // the close changed nothing, so its name is released
    if (!attrWritten) return;
    if (attrBefore === null) rmSync(attrPath, { force: true });
    else writeFileSync(attrPath, attrBefore, "utf8");
  };
  const branchFiles = new Set(git(root, "diff", "--name-only", base, branch).stdout.split("\n").filter(Boolean));
  const trunkFiles = git(root, "diff", "--name-only", base, trunk).stdout.split("\n").filter(Boolean);
  const ledgerRel = layout.ledger(root).slice(root.length + 1).replaceAll("\\", "/");
  const overlapLedger = trunkFiles.filter((f) => branchFiles.has(f)).filter((f) => f.startsWith(ledgerRel) && f.endsWith(".md"));

  const m = git(root, ...GIT_ID, "merge", "--no-commit", "--no-ff", branch);
  // WHITELIST GUARD (se.law-whitelist-guards): name the ONE acceptable outcome
  // and treat everything else as failure, rather than enumerating what can go
  // wrong. The accepted state after a merge attempt is: git reported success, a
  // MERGE_HEAD exists, and no path is unmerged. Blacklisting let two failures
  // through - a close that merged nothing, and a close that committed trunk's
  // own pending changes because the merge had refused on a dirty tree.
  const mergeAccepted =
    m.ok &&
    git(root, "rev-parse", "--verify", "-q", "MERGE_HEAD").ok &&
    git(root, "diff", "--name-only", "--diff-filter=U").stdout.trim() === "";
  if (!mergeAccepted) {
    const conflicted = git(root, "diff", "--name-only", "--diff-filter=U").stdout.split("\n").filter(Boolean);
    git(root, "merge", "--abort");
    undoClose();
    return conflicted.length > 0
      ? { merged: false, conflict: conflicted.join(", ").slice(0, 300), suspects: [] }
      : { merged: false, refused: `the merge did not reach an accepted state: ${(m.stderr || "no MERGE_HEAD").split("\n")[0].slice(0, 200)}`, suspects: [] };
  }

  // Withhold the record: drop this iteration's events from the pending merge.
  const staged = git(root, "ls-files", "--", `${ITER_HOME_REL}/${iteration}`).stdout.split("\n").filter(Boolean);
  const events = staged.filter((f) => isEventPath(f, iteration));
  if (events.length > 0) {
    git(root, "rm", "-r", "-q", "--cached", "--", ...events);
    for (const rel of events) rmSync(join(root, rel), { force: true });
    pruneEmptyDirs(join(root, ITER_HOME_REL, iteration));
  }
  if (attrWritten) git(root, "add", "--", ".gitattributes");
  const c = git(root, ...GIT_ID, "commit", "-m", `close ${iteration}: live claims only (record at ${tag})`);
  if (!c.ok) {
    git(root, "merge", "--abort");
    undoClose();
    return { merged: false, refused: `the close could not be committed: ${c.stderr.slice(0, 200)}`, suspects: [] };
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
  return { merged: true, suspects, tag };
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
