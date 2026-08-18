// Expeditions: the record is a folder on trunk. see dsp-record-lifecycle.md#the-close-is-the-ruling

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { RECORD_FINISHED } from "./iterations.ts";
import { parseStateNote, passEpoch, readNode, writeNode } from "./notes.ts";
import { dependsOnLines } from "./seed.ts";

/** Free prose as a YAML scalar. Backslashes first, then quotes — the other
 *  order doubles the escape it just added. */
function yamlScalar(s: string): string {
  return `"${s.replace(/\r?\n/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const SRC = "engine/worktree.ts";

// The register statuses that count as agreed. see dsp-record-lifecycle.md#a-disposition-is-agreed-never-asserted
const DISPOSED: ReadonlySet<string> = new Set(["closed", "superseded", "mitigated", "decided", "accepted", "deferred"]);

/** THE OWED ITEMS STILL STANDING IN A RECORD (req-close-refuses-loose-ends).
 *
 *  THE ROW WAS MINTED IN i1 AND HAD NO IMPLEMENTATION until i11. It is a must
 *  graded fatal saying the engine shall refuse the close while any finding
 *  stands without a recorded ruling. A probe went looking for the mechanism, to
 *  compare it against the form-side guard, and found nothing there.
 *
 *  IT READS THE RECORD AS IT STANDS ON DISK rather than re-deriving from form
 *  models. The close judges what was written, and an owed line is written.
 *
 *  A MISSING ENTRY HOLDS THE CLOSE. The form-side guard already refuses an
 *  unresolved ref at submit, so a missing one here means the entry was deleted
 *  after the form signed — which is the deletion-orphans defect, and the close
 *  is the last place to catch it. */
export function owedStanding(root: string, recordDir: string): { item: string; ref: string; where: string }[] {
  const evidence = join(root, recordDir, "evidence");
  if (!existsSync(evidence)) return [];
  const out: { item: string; ref: string; where: string }[] = [];
  for (const file of readdirSync(evidence)) {
    if (!file.endsWith(".md")) continue;
    for (const line of readFileSync(join(evidence, file), "utf8").split("\n")) {
      const m = /^- \[owed\] (.+?) — (\S+)\s*$/.exec(line.trim());
      if (m === null) continue;
      const ref = m[2].replace(/^\[\[|\]\]$/g, "");
      const node = join(root, "project", "spec", "trace", "raid", `${ref}.md`);
      const status = existsSync(node) ? (/^status: *(\w+)/m.exec(readFileSync(node, "utf8"))?.[1] ?? "") : "";
      if (!DISPOSED.has(status)) out.push({ item: m[1], ref, where: file });
    }
  }
  return out;
}

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

// `worktreesDir` IS DELETED (i34). It answered where a record's checkout would
// live. There are no worktrees, and nothing called it.

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

/** Undefined for pre-record expeditions. see dsp-record-lifecycle.md#the-close-is-the-ruling */
export function readRecord(root: string, e: Expedition): Record<string, unknown> | undefined {
  const rel = recordRel(e.id);
  {
    const abs = join(root, rel);
    if (!existsSync(abs)) return undefined;
    return frontmatterOf(readFileSync(abs, "utf8"), rel);
  }
}

// see dsp-record-lifecycle.md#the-close-is-the-ruling

// THE BRANCH LISTING IS GONE, AND WITH IT ITS CACHE (i6).
//
// `listBranches` answered one question: which records exist? It read local and
// pushed `it/*` and `exp/*` branches and merged them. i34 made a record a
// FOLDER on trunk, so `itList` and `expList` read directories and the branch
// listing had no caller left. It was still exported, still cached, still
// stat'ing seven ref paths per pass.
//
// WHAT WENT WITH IT.
//
// - `branchList`, the stamp-keyed listing cache.
// - `REF_STAMP` and `refStamp`/`refStampNow`, seven stats that existed only to
//   key that cache.
// - `bustBranchList`, whose own comment said the lane's seed and close both
//   called it. Neither did, by then.
//
// THE EXPEDITION CACHE STAYS. `EXP_LIST` is keyed on the pass epoch and needs
// no buster: a pass is one synchronous operation, and outside a pass the epoch
// is 0 and nothing is cached at all.
//
// WHAT THIS UNBLOCKS: nothing in the engine reads `origin/it/*` any more, so
// the twenty-six leftover branches on the remote can be deleted. That deletion
// is the owner's own act — the agent never pushes.
//
// THE MEASUREMENT THE OLD CACHE WAS BUILT ON, kept because it is the reason
// the cache existed rather than a reason to keep it: one render asked for four
// listings, 4.9 seconds of a profiled session sat inside spawnSync under those
// callers, and entering one record cost 1,580 stats.

/** One existsSync per expedition, and the walk asks for the whole list over
 *  and over: 5,824 of them to enter one record. Inside a pass the answer is
 *  built once — a folder cannot appear halfway through a synchronous
 *  operation.
 *
 *  NO BUSTER, AND NONE IS MISSING (i6). `bustBranchList` used to clear this
 *  and was deleted with the branch listing it was named for. Nothing called
 *  it. The epoch does the work: outside a pass `passEpoch()` is 0 and nothing
 *  is cached at all. */
const EXP_LIST = new Map<string, { epoch: number; value: Expedition[] }>();

/** see dsp-record-lifecycle.md#the-close-is-the-ruling */
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

export function expNew(root: string, kind: string, goal: string, dependsOn: string[] = []): Expedition {
  const KINDS = ["spike", "fix", "explore"];
  if (!KINDS.includes(kind)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `kind: ${KINDS.join(" | ")}`,
      got: JSON.stringify(kind),
      remedy: {
        tool: "se_seed_expedition",
        args: { kind: "spike", goal, depends_on: [] },
        note: "declare what kind of expedition this is; depends_on: [] states that it waits for nothing",
      },
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
      // THE SEED STATES ITS DEPENDENCY, AND AN EXPEDITION IS A SEED (i6). It
      // waits less often than an iteration does, which is exactly why the
      // silence used to pass unnoticed here.
      ...dependsOnLines(dependsOn),
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

/** see dsp-record-lifecycle.md#a-dirty-trunk-is-settled-first */
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
  // see dsp-record-lifecycle.md#quoted-because-the-writer-controls-the-field-and-not
  const stamped = (override ?? "").trim();
  const raw = readFileSync(recAbs, "utf8");
  writeFileSync(
    recAbs,
    raw.replace(
      /^status: open$/m,
      `status: closed\nclosed: ${new Date().toISOString()}\nruling: ${merge ? "applied" : "dismissed"}${stamped === "" ? "" : `\nreport_override: ${yamlScalar(stamped)}`}${carriedStamp(owedStanding(root, `project/spec/expeditions/${e.id}`))}`,
    ),
    "utf8",
  );
}

/** see dsp-record-lifecycle.md#the-close-hands-over */
function carriedStamp(standing: { item: string; ref: string; where: string }[]): string {
  if (standing.length === 0) return "";
  // ON THE RECORD, NOT IN A SIDE FILE. A carried list nobody counts is the
  // same as losing them slowly, and the record is what the next one reads.
  const lines = standing.map((o) => `  - ${o.item} — ${o.ref} (${o.where})`).join("\n");
  return `\ncarried_count: ${String(standing.length)}\ncarried:\n${lines}`;
}

// see dsp-record-lifecycle.md#mergeandretire-and-mergetotrunk-are-gone

/** see dsp-record-lifecycle.md#close-the-shipped-iteration */
export function itCloseShipped(
  root: string,
  rec: { id: string; branch: string; path: string },
): { closed: string; trunk_committed?: string[]; carried?: { item: string; ref: string; where: string }[] } {
  const trunkCommitted = settleTrunk(root, rec.id);
  const recAbs = join(root, `project/spec/iterations/${rec.id}/record.md`);
  const raw = readNode(recAbs);
  // THE ITERATION CLOSE CARRIES TOO, and until today it did nothing at all.
  //
  // THE GUARD WAS BUILT ON THE EXPEDITION CLOSE ONLY — `stampRecordClosed`,
  // reached from expClose, reading a hardcoded `project/spec/expeditions/`
  // path. An iteration closes through HERE and never looked. i11 shipped past
  // nine owed items with the mechanism it had just built watching the wrong
  // door, and the evidence said three times that the close would refuse.
  const standing = owedStanding(root, `project/spec/iterations/${rec.id}`);
  if (raw !== "" && !/^closed: /m.test(raw)) {
    writeNode(recAbs, raw.replace(/^status: .*$/m, `status: shipped\nclosed: ${new Date().toISOString()}${carriedStamp(standing)}`));
  }
  if (git(root, ["status", "--porcelain"], "status").trim() !== "") {
    git(root, ["add", "-A"], "add");
    git(root, ["commit", "-q", "-m", `iteration ${rec.id}: shipped`], "commit");
  }
  // THE ANSWER NAMES WHAT WAS CARRIED, so a handover is never silent. A close
  // that carries nine findings and says nothing is the same as losing them.
  return {
    closed: rec.id,
    ...(trunkCommitted.length > 0 ? { trunk_committed: trunkCommitted } : {}),
    ...(standing.length > 0 ? { carried: standing } : {}),
  };
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
