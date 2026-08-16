// Expeditions — ad hoc work as git worktrees (the context-manager model):
// entering creates a worktree on its own branch, continuing binds the lane
// to it, and the CLOSE IS THE RULING (owner 2026-07-27): apply merges the
// changes to trunk, dismiss archives the branch unmerged. The worktree IS
// the record; the archive is git history (exp/* branches).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { RECORD_FINISHED } from "./iterations.ts";
import { parseStateNote, passEpoch, readNode, writeNode } from "./notes.ts";

/** Free prose as a YAML scalar. Backslashes first, then quotes — the other
 *  order doubles the escape it just added. */
function yamlScalar(s: string): string {
  return `"${s.replace(/\r?\n/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

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
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "work"
  );
}

export interface Expedition {
  id: string;
  /** The seed stub reached the remote at mint (absent on old records). */
  announced?: boolean;
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
  return `project/spec/expeditions/${id}/record.md`;
}

// THE BRANCH-RECORD CACHE IS GONE (i34). A closed expedition's branch never
// moves, so its record was read once and kept. There is no branch read left to
// cache: the record is a file in the tree, and the filesystem is the cache.

/** A record that does not PARSE must not take the container down with it.
 *  One malformed record broke the expeditions machine, and with it the
 *  archive, the survey and the route — everything that lists what stands.
 *  It comes back MARKED instead, so a reader sees the damage rather than a
 *  hole where an expedition used to be. */
export function frontmatterOf(raw: string, where: string): Record<string, unknown> {
  try {
    return parseStateNote(raw).frontmatter;
  } catch (err) {
    return { unreadable: `${where} does not parse — ${String((err as Error).message).split("\n")[0]}` };
  }
}

/** THE RECORD'S FRONTMATTER, from the one tree (owner ruling 2026-08-16).
 *
 *  IT USED TO COME FROM THREE PLACES: the worktree while open, a merged copy
 *  on trunk, and failing both, `git show <branch>:<rel>`. Which one answered
 *  depended on what happened to exist, and that is the retrieval path i34
 *  deletes.
 *
 *  Undefined for pre-record expeditions (e1–e3). */
export function readRecord(root: string, e: Expedition): Record<string, unknown> | undefined {
  const rel = recordRel(e.id);
  {
    const abs = join(root, rel);
    if (!existsSync(abs)) return undefined;
    return frontmatterOf(readFileSync(abs, "utf8"), rel);
  }
}

// THE BRANCH READ IS GONE (i34). A closed expedition's record used to live on
// its branch — "history is git's, the tree carries only live work", the ruling
// of 2026-07-28 — so this fell back to `git show <branch>:<rel>` and cached
// the result, because a closed branch never moves.
//
// THE ARCHIVE LIVES ON DISK NOW, so the folder is still there and there is
// nothing to retrieve.

/** THE BRANCH LISTING IS A SPAWNED PROCESS, AND ONE RENDER ASKS FOUR TIMES.
 *  The expeditions container, the expedition archive, the iterations
 *  container and the iteration archive each want a list, so each render paid
 *  four git processes - 4.9 seconds of one profiled session sat inside
 *  spawnSync under exactly these two callers.
 *
 *  IT WAS A ONE-SECOND TTL AND THAT WAS THE WRONG SHAPE (measured
 *  2026-08-09). A timer only helps when the burst is shorter than the timer.
 *  Entering a record takes 3.7 s and the mirror polls every second, so the
 *  window was GUARANTEED to lapse mid-operation and spawn again. A profile of
 *  that entry found 301 ticks with 20.6 % in JavaScript: the walk was not
 *  computing, it was BLOCKED, and a bare git spawn is 40.6 ms of blocking.
 *
 *  SO IT IS STAMPED, NOT TIMED. The answer changes when git's ref store
 *  changes, and that is a stat rather than a clock. Same rule as the corpus
 *  (software.md): key the answer to a hash of its input, and recompute when
 *  the input moves rather than when a timer says so.
 *
 *  WHY STATTING THE SUBDIRECTORIES. Our globs are `it/*` and `exp/*`, so the
 *  refs live one level down and the parent's mtime does not move when a child
 *  is added. A directory's mtime DOES move when one of its own entries is
 *  created or removed, which is exactly the change a NAME listing cares
 *  about. A branch repointed to a new commit rewrites a file without renaming
 *  it, and that cannot change this answer.
 *
 *  Anything in the lane that moves a ref still calls bustBranchList. */
const branchList = new Map<string, { stamp: string; branches?: string[]; failure?: Rejection }>();

/** The four ref paths, stat'd once per pass. Every branch list asks for this
 *  and the walk asks for branch lists constantly — 1,580 stats to enter one
 *  record, for four files that cannot move inside one synchronous operation. */
const REF_STAMP = new Map<string, { epoch: number; value: string }>();

function refStamp(root: string): string {
  const era = passEpoch();
  const seen = REF_STAMP.get(root);
  if (seen !== undefined && era !== 0 && seen.epoch === era) return seen.value;
  const value = refStampNow(root);
  if (era !== 0) REF_STAMP.set(root, { epoch: era, value });
  return value;
}

function refStampNow(root: string): string {
  const g = join(root, ".git");
  const parts: string[] = [];
  // THE REMOTE HALF IS STAMPED TOO, since listBranches now reads it: a
  // fetch that brought a new pushed record would otherwise leave the
  // cached listing standing, and the record would stay invisible until
  // something local happened to move.
  for (const p of [
    join(g, "packed-refs"),
    join(g, "refs", "heads"),
    join(g, "refs", "heads", "it"),
    join(g, "refs", "heads", "exp"),
    join(g, "refs", "remotes", "origin"),
    join(g, "refs", "remotes", "origin", "it"),
    join(g, "refs", "remotes", "origin", "exp"),
  ]) {
    try {
      const s = statSync(p);
      parts.push(`${s.size}:${s.mtimeMs}`);
    } catch {
      parts.push("gone");
    }
  }
  return parts.join("|");
}

export function bustBranchList(): void {
  branchList.clear();
  REF_STAMP.clear();
  EXP_LIST.clear();
}

export function listBranches(root: string, glob: string): string[] {
  const key = `${root} :: ${glob}`;
  const stamp = refStamp(root);
  const hit = branchList.get(key);
  if (hit !== undefined && hit.stamp === stamp) {
    if (hit.branches !== undefined) return hit.branches;
    // A FAILURE IS CACHED TOO (profiled 2026-08-02): a root with no
    // repository failed this spawn dozens of times per walk — half a
    // second of every booted suite walk — because only successes were
    // remembered.
    throw hit.failure;
  }
  try {
    // LOCAL AND PUSHED BOTH COUNT (2026-08-12, first run on a second
    // machine). A fresh clone carries no local it/* or exp/* branches at
    // all — git creates a local branch only for the one it checks out — so
    // a machine-local listing made every pushed record INVISIBLE. The
    // container, the survey and the archive all read empty on a box that
    // had just cloned the repo, and the record the walk was sent to run
    // could not be seen from the machine sent to run it.
    //
    // The remote half is normalised to its short name (origin/it/i8 reads
    // as it/i8) and merged with the local half, so a record standing on
    // both sides is listed exactly once. The symbolic origin/HEAD entry
    // carries an arrow and is dropped.
    const lines = (out: string): string[] =>
      out
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b !== "" && !b.includes("->"));
    const local = lines(git(root, ["branch", "--list", glob, "--format=%(refname:short)"], "branch --list"));
    const remote = lines(
      git(root, ["branch", "--remotes", "--list", `*/${glob}`, "--format=%(refname:short)"], "branch --list --remotes"),
    ).map((b) => b.slice(b.indexOf("/") + 1));
    const branches = [...new Set([...local, ...remote])];
    branchList.set(key, { stamp, branches });
    return branches;
  } catch (e) {
    if (e instanceof Rejection) branchList.set(key, { stamp, failure: e });
    throw e;
  }
}

/** One existsSync per expedition, and the walk asks for the whole list over
 *  and over: 5,824 of them to enter one record. Inside a pass the answer is
 *  built once — a worktree cannot appear halfway through a synchronous
 *  operation, and the lane's own seed and close both call bustBranchList. */
const EXP_LIST = new Map<string, { epoch: number; value: Expedition[] }>();

/** EVERY EXPEDITION IS A FOLDER ON TRUNK, and OPEN comes from its own status
 *  — the same shape iterations took at i34 (owner ruling 2026-08-16: "do the
 *  same for expeditions").
 *
 *  BEFORE THIS the list came from `exp/*` branches and open meant "a worktree
 *  directory exists". Both halves asked the filesystem a question the record
 *  already answers. */
export function expList(root: string): Expedition[] {
  const era = passEpoch();
  const seen = EXP_LIST.get(root);
  // A COPY. The sort below hands back a fresh array today; a caller that
  // mutates the stored one would otherwise poison every later reader.
  if (seen !== undefined && era !== 0 && seen.epoch === era) return seen.value.slice();
  const out: Expedition[] = [];
  const dir = join(root, "project", "spec", "expeditions");
  if (existsSync(dir)) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const id = entry.name;
      // A FOLDER WITHOUT A RECORD IS NOT A RECORD. e1–e3 predate the record
      // file and were never listed by id alone either.
      const abs = join(dir, id, "record.md");
      if (!existsSync(abs)) continue;
      const status = String(frontmatterOf(readFileSync(abs, "utf8"), abs).status ?? "");
      out.push({ id, branch: `exp/${id}`, path: root, open: !RECORD_FINISHED.has(status) });
    }
  }
  // NUMERIC order — git lists branches alphabetically (e1, e10, e11, …,
  // e2), which reads as missing entries to a human scanning for e10.
  out.sort((a, b) => Number(a.id.match(/^e(\d+)/)?.[1] ?? 0) - Number(b.id.match(/^e(\d+)/)?.[1] ?? 0));
  if (era !== 0) EXP_LIST.set(root, { epoch: era, value: out.slice() });
  return out;
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
  const n =
    expList(root).reduce((max, e) => {
      const m = e.id.match(/^e(\d+)-/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0) + 1;
  const id = `e${n}-${kind}-${slug(goal)}`;
  // THE SEED MINTS A FOLDER ON TRUNK AND NOTHING ELSE (i34). Gone with the
  // worktree: the branch, the seed push that announced a stub to a peer, and
  // the npm install that paid for a second tree's node_modules.
  const recAbs = join(root, recordRel(id));
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
  git(root, ["add", "--", recordRel(id)], "add");
  git(root, ["commit", "-q", "-m", `expedition ${id}: open`, "--", recordRel(id)], "commit");
  return { id, branch: `exp/${id}`, path: root, open: true };
}

export function expFind(root: string, id: string): Expedition {
  const e = expList(root).find((x) => x.id === id);
  if (e === undefined || !e.open) {
    const open = expList(root)
      .filter((x) => x.open)
      .map((x) => x.id);
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `an OPEN expedition: ${open.join(", ") || "(none — start one first)"}`,
      got: id,
      remedy: { tool: "se_pull", args: {}, note: "continue_expedition lists the open expeditions — entering one binds it" },
      source: SRC,
    });
  }
  return e;
}

/** A DIRTY TRUNK IS SETTLED FIRST (found live 2026-07-28, closing e18).
 *  git merge refuses to overwrite uncommitted local changes, so the merge
 *  below failed — and the abort that follows it failed too, because no merge
 *  had started. The record was already stamped closed by then, leaving an
 *  expedition marked shut, unmerged, with its worktree still standing.
 *
 *  The close COMMITS the root's strays rather than refusing (owner ruling
 *  2026-07-28). It already does exactly this on the other side of the merge,
 *  on the principle that a walk's work never silently vanishes; the root
 *  deserves the same. Not a stash: a stash pop can conflict AFTER the merge
 *  has started, which strands uncommitted work halfway through a close.
 *
 *  TRACKED changes only, via commit -a. Untracked files are left alone, so
 *  .worktrees and every scratch file stay out of it. An untracked file the
 *  incoming branch also creates still fails the merge below, which aborts
 *  cleanly and says so.
 *
 *  Keeping trunk clean is also what keeps the READ-PROOF honest: a worktree
 *  branches from the last commit, so a dirty trunk is exactly when the tree
 *  the lane serves and the tree the proof hashes drift apart. */
function settleTrunk(root: string, expeditionId: string): string[] {
  const strays = git(root, ["status", "--porcelain", "--untracked-files=no"], "status")
    .split("\n")
    .map((l) => l.slice(3).trim())
    .filter((f) => f !== "");
  if (strays.length > 0) {
    git(root, ["commit", "-a", "-m", `trunk: strays committed by the close of ${expeditionId}`], "commit trunk");
  }
  return strays;
}

/** The close ruling stamps the record: applied (merged) or dismissed
 *  (unmerged). Guards ride here: the report must exist, and an agent-finished
 *  report needs a recorded override. */
function stampRecordClosed(root: string, e: Expedition, merge: boolean, override?: string): void {
  const recAbs = join(root, recordRel(e.id));
  if (!existsSync(recAbs)) return;
  // The expedition ends with a REPORT (owner ruling 2026-07-27); the
  // close ruling stamps it: applied (merged) or dismissed (unmerged).
  const repRel = `project/spec/expeditions/${e.id}/report.md`;
  if (!existsSync(join(root, repRel))) {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `a report before closing: ${repRel} — what was built or found, for the retro to adjudicate`,
      got: "no report.md in the expedition record",
      remedy: {
        tool: "se_file_write",
        args: { path: repRel, content: "<goal · what shipped or was found · open threads>", base_hash: null },
        note: "write the report, then close again",
      },
      source: SRC,
    });
  }
  // THE PREFILL GUARD WAS LIFTED BY A SENTENCE IN CHAT, TWICE (e20 and e21,
  // note-c93953578cde and note-afd649b506a0). The report stamps whose hand
  // finished it, human or agent, and NOTHING had ever read that stamp. A
  // report the agent wrote and finished itself passed exactly like one a
  // person walked through field by field.
  //
  // Both lifts were legitimate — the owner asked for an unattended run. The
  // defect was that the record could not SHOW it, so the only evidence was a
  // line the agent chose to write. That punished honesty: an agent that said
  // nothing left a cleaner-looking archive than one that owned up.
  //
  // The override is a lane act now, and it is stamped on the record. An
  // override is LOUDER than compliance, never quieter.
  const finishedBy = /^by: *(\w+)/m.exec(readFileSync(join(root, repRel), "utf8"))?.[1];
  if (finishedBy !== "human" && (override ?? "").trim() === "") {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: "a report a person confirmed, or a recorded override naming who lifted the guard",
      got: `the report was finished by the ${finishedBy ?? "agent"}`,
      remedy: {
        tool: "se_exp_close",
        args: { merge, override: "<who authorised the unattended close, and where they said it>" },
        note: "confirm the report in the mirror, or close with the override — it is stamped on the record and shows in the archive",
      },
      source: SRC,
    });
  }
  // QUOTED, because the writer controls the field and NOT its content.
  // An override is free prose from a person, so it carries colons, quotes
  // and line breaks. Unquoted, "in chat, 2026-07-29: after reading" is a
  // nested mapping and the WHOLE record stops parsing. That happened for
  // real on e22 and took the record down with it.
  const stamped = (override ?? "").trim();
  const raw = readFileSync(recAbs, "utf8");
  writeFileSync(
    recAbs,
    raw.replace(
      /^status: open$/m,
      `status: closed\nclosed: ${new Date().toISOString()}\nruling: ${merge ? "applied" : "dismissed"}${stamped === "" ? "" : `\nreport_override: ${yamlScalar(stamped)}`}`,
    ),
    "utf8",
  );
}

// `mergeAndRetire` AND `mergeToTrunk` ARE GONE (i34). They merged a record's
// branch to trunk and then ran `git rm -r` on the record's directory, under
// the 2026-07-28 ruling that closed records live in git and the tree carries
// only live work.
//
// THERE IS NOTHING TO MERGE, because a record's work is written on trunk from
// the first keystroke, and NOTHING TO RETIRE, because the archive reads the
// folder from disk.
//
// WHAT WENT WITH THEM: the conflict handling, the abort, and the typed refusal
// that named the conflicting files. A merge that cannot happen cannot conflict.

/** CLOSE THE SHIPPED ITERATION — fired by the walk itself as it leaves
 *  through the terminal (owner ruling 2026-08-11: after the last bless the
 *  iteration archives itself, exactly like an expedition). The blessed
 *  release gate was the human ruling, so this close carries no second
 *  judgment and no report guard. Trunk strays settle, leftovers commit,
 *  the branch merges, the record dir retires to its branch, the worktree
 *  goes — the iteration archive lists it from then on. */
export function itCloseShipped(
  root: string,
  rec: { id: string; branch: string; path: string },
): { closed: string; trunk_committed?: string[] } {
  const trunkCommitted = settleTrunk(root, rec.id);
  const recAbs = join(root, `project/spec/iterations/${rec.id}/record.md`);
  const raw = readNode(recAbs);
  if (raw !== "" && !/^closed: /m.test(raw)) {
    writeNode(recAbs, raw.replace(/^status: .*$/m, `status: shipped\nclosed: ${new Date().toISOString()}`));
  }
  if (git(root, ["status", "--porcelain"], "status").trim() !== "") {
    git(root, ["add", "-A"], "add");
    git(root, ["commit", "-q", "-m", `iteration ${rec.id}: shipped`], "commit");
  }
  return { closed: rec.id, ...(trunkCommitted.length > 0 ? { trunk_committed: trunkCommitted } : {}) };
}

/** Close IS the ruling: apply (merge=true) or dismiss (merge=false). The
 *  ruling is stamped on the record and leftovers are committed either way.
 *
 *  WHAT i34 TOOK OUT. The work already stands on trunk, because there is one
 *  tree, so there is no branch to merge and no worktree to remove. `merge`
 *  is now the RULING alone rather than a ruling that also moved bytes.
 *
 *  DISMISS NO LONGER DISCARDS ANYTHING, and that is a real change worth
 *  naming: an unmerged branch used to keep a dismissed expedition's changes
 *  off trunk. They are on trunk from the moment they are written now, so a
 *  dismissal records a judgment and reverting the work is a separate act. */
export function expClose(
  root: string,
  e: Expedition,
  merge: boolean,
  override?: string,
): { id: string; merged: boolean; trunk_committed?: string[]; override?: string } {
  const trunkCommitted = merge ? settleTrunk(root, e.id) : [];
  stampRecordClosed(root, e, merge, override);
  // Leftover changes are committed — a walk's work never silently vanishes.
  const dirty = git(root, ["status", "--porcelain"], "status").trim() !== "";
  if (dirty) {
    git(root, ["add", "-A"], "add");
    git(root, ["commit", "-m", `expedition ${e.id}: close`], "commit");
  }
  // NEVER SILENT. Committing someone's uncommitted work on their behalf is a
  // kindness only if they are told it happened, and which files it took.
  return {
    id: e.id,
    merged: merge,
    ...(trunkCommitted.length > 0 ? { trunk_committed: trunkCommitted } : {}),
    ...((override ?? "").trim() === "" ? {} : { override: (override ?? "").trim() }),
  };
}
