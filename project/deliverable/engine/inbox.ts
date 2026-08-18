// The stray-note inbox — se_note's landing strip (.se/notes.jsonl,
// machine-local). A note is PENDING until a retro drains it; no drain
// machinery exists yet, so every note on file is pending. The mirror's
// feed surfaces pending notes from EARLIER sessions too — the inbox must
// never fall out of sight just because the session rolled over.

import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { stripBom } from "./jsonio.ts";
import { mintToken } from "./pool.ts";

/** MoSCoW, minus the fourth bucket. "Won't" already exists here as a drain
 *  disposition, so a note never needs to carry it. */
export type Priority = "must" | "should" | "could";
export const PRIORITIES: readonly Priority[] = ["must", "should", "could"];

/** An unmarked note is a COULD. A stray is noticed in passing, and defaulting
 *  to the middle would flatten the sort the priority exists to give. */
export const DEFAULT_PRIORITY: Priority = "could";

const RANK: Record<Priority, number> = { must: 0, should: 1, could: 2 };
const TITLE_CAP = 80;

export interface StrayNote {
  ref: string;
  text: string;
  at: string;
  /** The author's own one-line title. Absent on notes written before titles
   *  existed, and derived from the first line for those. */
  title?: string;
  priority?: Priority;
  /** Whose hand captured it — agent | human (absent on old notes = agent). */
  by?: string;
  /** Set by a retro's disposition — a drained note leaves the inbox.
   *  backlog MINTS a work token on trunk and the raw note stays here,
   *  local and unmoved. The token is what a later iteration pulls in. */
  drained?: { at: string; disposition: string; where?: string };
}

function notesPath(seDirPath: string): string {
  return join(seDirPath, "notes.jsonl");
}

/** One line from a long value, cut at a WORD boundary and marked as cut.
 *  Shared by the note title and the survey's goals, because a mid-word cut
 *  was the specific complaint that made the survey answer in full. */
export function headline(t: string, cap: number): string {
  const flat = t.replace(/\s+/g, " ").trim();
  if (flat.length <= cap) return flat;
  const cut = flat.slice(0, cap);
  const space = cut.lastIndexOf(" ");
  return `${(space > cap * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** The note's own title, or its first line where an older note has none.
 *  A derived title POINTS AT the text and never replaces it — the whole note
 *  stays readable with se_log_query {ref}. */
export function titleOf(n: StrayNote): string {
  if (n.title !== undefined && n.title.trim() !== "") return n.title.trim();
  const first = n.text.split("\n").find((l) => l.trim() !== "") ?? "";
  return headline(first.replace(/^#+\s*/, ""), TITLE_CAP);
}

export function priorityOf(n: StrayNote): Priority {
  return n.priority !== undefined && PRIORITIES.includes(n.priority) ? n.priority : DEFAULT_PRIORITY;
}

export function byPriority(a: StrayNote, b: StrayNote): number {
  return RANK[priorityOf(a)] - RANK[priorityOf(b)];
}

export function appendNote(
  seDirPath: string,
  text: string,
  by = "agent",
  title?: string,
  priority?: Priority,
): { captured: string; inbox: number } {
  const p = notesPath(seDirPath);
  const note: StrayNote = {
    ref: `note-${randomBytes(6).toString("hex")}`,
    text,
    at: new Date().toISOString(),
    ...(title !== undefined && title.trim() !== "" ? { title: title.trim() } : {}),
    ...(priority !== undefined ? { priority } : {}),
    by,
  };
  mkdirSync(dirname(p), { recursive: true });
  appendFileSync(p, `${JSON.stringify(note)}\n`, "utf8");
  return { captured: note.ref, inbox: pendingNotes(seDirPath).length };
}

/** PENDING = not yet drained — what the feed shows and the count counts. */
export function pendingNotes(seDirPath: string): StrayNote[] {
  return readNotes(seDirPath).filter((n) => n.drained === undefined);
}

const DISPOSITIONS = ["done", "obsolete", "carried", "backlog"];
/** The two that decide what work MEANS and when it comes back. Everything
 *  else is a check anyone can run: superseded by a named note, already in
 *  the code, ruled on since it was parked. */
const JUDGMENT: ReadonlySet<string> = new Set(["carried", "backlog"]);

/** see dsp-note-pen.md#the-retros-mechanical-half */
export function drainNote(
  seDirPath: string,
  ref: string,
  disposition: string,
  where: string | undefined,
  judgmentAllowed: boolean,
  statement?: string,
  projectRoot?: string,
  mintedIn?: string,
): { drained: string; disposition: string; inbox: number; minted?: string } {
  if (!DISPOSITIONS.includes(disposition)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `disposition: ${DISPOSITIONS.join(" | ")}`,
      got: JSON.stringify(disposition),
      remedy: {
        tool: "se_note_drain",
        args: { ref, disposition: "done" },
        note: "backlog mints a work token on trunk — where: 'ready when …' and statement: '<what it is>' are then both required",
      },
      source: "engine/inbox.ts drain",
    });
  }
  if (!judgmentAllowed && JUDGMENT.has(disposition)) {
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: "disposition: done | obsolete — the mechanical ones",
      got: `${disposition} outside the retro`,
      remedy: {
        tool: "se_pull",
        args: { form: { choice: "retro" } },
        note: "the retro is a door from idle, and it is where carried and backlog are legal — they decide what the work MEANS and when it returns, which wants the whole picture. done and obsolete are checks anyone can run, so they drain wherever the tool is legal",
      },
      source: "engine/inbox.ts drain",
    });
  }
  if (disposition === "backlog" && (where === undefined || where.trim() === "")) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "where: 'ready when …' — the parked note's re-entry condition",
      got: "no where",
      remedy: {
        tool: "se_note_drain",
        args: { ref, disposition: "backlog", where: "ready when <condition>" },
        note: "a parked note without a re-entry condition is never re-entered",
      },
      source: "engine/inbox.ts drain",
    });
  }
  const all = readNotes(seDirPath);
  const hit = all.find((n) => n.ref === ref);
  if (hit === undefined) {
    throw new Rejection({
      clause: CLAUSES.NOTE_UNKNOWN,
      expected: "an existing note ref",
      got: ref,
      remedy: {
        tool: "se_note_drain",
        args: { ref: "<a ref from the pending list>", disposition: "done | obsolete | carried | backlog" },
        note: "the mirror's feed (filter: note) and .se/notes.jsonl carry the refs",
      },
      source: "engine/inbox.ts drain",
    });
  }
  // THE MINT COMES FIRST, AND THE ORDER IS THE GUARANTEE. A refused mint must
  // leave the note exactly as it found it — pending, undrained, still in the
  // count — or a rejected crossing would silently consume the note anyway.
  let minted: string | undefined;
  if (disposition === "backlog") {
    if (projectRoot === undefined) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a project root — the pool is a corpus node and lands in the repository",
        got: "no root",
        remedy: {
          tool: "se_note_drain",
          args: { ref, disposition: "backlog" },
          note: "an internal wiring fault: the caller did not pass the root through",
        },
        source: "engine/inbox.ts drain",
      });
    }
    // A NOTE ALREADY IN THE POOL DOES NOT MINT A SECOND TOKEN. Re-draining is
    // the migration mechanism and stays legal for every other disposition;
    // what is refused is minting one finding twice, which is the failure
    // req-the-raw-note-stays-local-and-is-marked-drained names by name.
    if (hit.drained?.disposition === "backlog") {
      throw new Rejection({
        clause: CLAUSES.NOTE_UNKNOWN,
        expected: "a note that is not already in the pool",
        got: `${ref} was drained to the pool at ${hit.drained.at}`,
        remedy: {
          tool: "se_note_drain",
          args: { ref, disposition: "carried", where: "this round" },
          note: "to pull a parked item into scope, re-drain it as carried — the token already stands and minting a second one splits the finding in two",
        },
        source: "engine/inbox.ts drain",
      });
    }
    minted = mintToken(projectRoot, {
      statement: statement ?? "",
      readyWhen: where ?? "",
      source: ref,
      noteText: hit.text,
      ...(mintedIn !== undefined && mintedIn !== "" ? { mintedIn } : {}),
    }).id;
  }
  hit.drained = { at: new Date().toISOString(), disposition, ...(where !== undefined && where !== "" ? { where } : {}) };
  writeFileSync(notesPath(seDirPath), `${all.map((n) => JSON.stringify(n)).join("\n")}\n`, "utf8");
  return {
    drained: ref,
    disposition,
    inbox: all.filter((n) => n.drained === undefined).length,
    ...(minted !== undefined ? { minted } : {}),
  };
}

/** THE NOTES THAT WERE DRAINED TO THE POOL — the local half of the crossing.
 *
 *  IT IS NOT THE POOL, and after i17 nothing reads it as one. The pool is
 *  `standingOptions` in engine/pool.ts, on trunk, readable from any clone.
 *  These are the local notes that produced one, kept so the two ends of a
 *  crossing can still be found from each other. */
export function backlogNotes(seDirPath: string): StrayNote[] {
  return readNotes(seDirPath).filter((n) => n.drained !== undefined && n.drained.disposition === "backlog");
}

export function readNotes(seDirPath: string): StrayNote[] {
  const p = notesPath(seDirPath);
  if (!existsSync(p)) return [];
  const out: StrayNote[] = [];
  for (const line of stripBom(readFileSync(p, "utf8")).split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as StrayNote);
    } catch {}
  }
  return out;
}
