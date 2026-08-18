// WHAT STANDS OPEN — one mechanical answer: open expeditions, open
// iterations, pending notes, and parked backlog items with their ready-when.
//
// BOTH HANDS ASK IT (owner ruling 2026-07-28). The agent calls se_survey;
// the person clicks it in the mirror. It lived inside the tool handler and
// so was reachable only by the agent, which made "what is open" a question
// the owner had to route through someone else. One implementation, two
// doors.
import { byPriority, DEFAULT_PRIORITY, headline, type Priority, pendingNotes, priorityOf, titleOf } from "./inbox.ts";
import { itList, readItRecord } from "./iterations.ts";
import { seDir } from "./paths.ts";
import { standingOptions } from "./pool.ts";
import { expList, readRecord } from "./worktree.ts";

export interface Survey {
  counts: { expeditions: number; iterations: number; notes: number; backlog: number };
  expeditions: { id: string; goal: string }[];
  iterations: { id: string; goal: string }[];
  notes: { ref: string; at: string; title: string; priority: Priority; text?: string }[];
  backlog: { ref: string; ready_when: string; title: string; priority: Priority; text?: string }[];
  /** Present whenever the notes list was WINDOWED, so a paged answer can
   *  never be mistaken for the whole inbox. */
  notes_window?: { offset: number; shown: number; remaining: number };
  /** The backlog windows WITH the notes — one limit, both lists. It once
   *  rode along whole on every windowed call and overflowed the host
   *  (2026-08-02, at 44 parked items). */
  backlog_window?: { offset: number; shown: number; remaining: number };
}

export interface SurveyOptions {
  /** full adds every note's whole body to the listing. The default lists
   *  title and priority only, and the body is one se_log_query {ref} away. */
  detail?: "full" | "brief";
  /** A window over the NOTES list. Counts stay complete, so a window never
   *  hides how much there is. */
  limit?: number;
  offset?: number;
}

/** How much of a record's goal the listing carries. The rest is in the
 *  record, which is where a goal that long belongs anyway. */
const GOAL_CAP = 200;

// A record that will not parse is SHOWN as unreadable, never as an empty
// goal. An empty goal reads as an expedition nobody bothered to describe;
// the truth is a broken file, and only the truth gets it fixed.
const goalOf = (fm: Record<string, unknown> | undefined): string =>
  fm?.unreadable !== undefined ? `⚠ ${String(fm.unreadable)}` : headline(String(fm?.goal ?? ""), GOAL_CAP);

// THE FINISHED SET MOVED TO iterations.ts AT i34, as RECORD_FINISHED. It was
// defined here and nowhere else, so the survey knew a shipped record was not
// open and itList did not — and on 2026-08-16 i28 stood in the container's
// list and not in the survey's, with nothing saying they disagreed.
//
// itList NOW APPLIES IT ITSELF, so this file no longer needs its own copy and
// no longer needs to filter.

export function survey(projectRoot: string, opts: SurveyOptions = {}): Survey {
  const exps = expList(projectRoot)
    .filter((e) => e.open)
    .map((e) => ({ id: e.id, goal: goalOf(readRecord(projectRoot, e)) }));
  // A SHIPPED RECORD IS NOT OPEN, whatever its worktree says. itList calls a
  // record open when its worktree directory EXISTS, and a close leaves that
  // directory behind — so i27 stood in the open list the day after it shipped
  // and the desk advised from a count one too high.
  //
  // The record's own status is the truth, and the goal read below already
  // fetches it, so the filter costs nothing. The expedition list above wants
  // the same guard the day an expedition is seen doing this.
  const its = itList(projectRoot)
    .filter((i) => i.open)
    .map((i) => ({ id: i.id, goal: goalOf(readItRecord(projectRoot, i)) }));
  const withText = opts.detail === "full";
  const allNotes = pendingNotes(seDir(projectRoot))
    .sort(byPriority)
    .map((n) => ({ ref: n.ref, at: n.at, title: titleOf(n), priority: priorityOf(n), ...(withText ? { text: n.text } : {}) }));
  const offset = Math.max(0, opts.offset ?? 0);
  const windowed = opts.limit !== undefined || offset > 0;
  const notes = windowed ? allNotes.slice(offset, offset + (opts.limit ?? allNotes.length)) : allNotes;
  // THE POOL IS READ FROM THE REPOSITORY, NEVER FROM THE NOTE STORE (i17).
  // It used to list `backlogNotes`, which live in `.se/` — machine-local and
  // gitignored — so two clones disagreed about what the project was holding and
  // neither was wrong. Measured 2026-08-18: a fresh clone reported 0 parked
  // options while the machine that parked them reported 205.
  //
  // AN UNDRAINED CAPTURE IS NOT AN OPTION and deliberately never enters here.
  // It has not been judged, and this list is what somebody may commit to. The
  // pending count above stays the separate signal it always was.
  const allBacklog = standingOptions(projectRoot).map((o) => ({
    ref: o.id,
    ready_when: o.ready_when,
    title: headline(o.statement, GOAL_CAP),
    priority: DEFAULT_PRIORITY,
    ...(withText ? { text: o.statement } : {}),
  }));
  const backlog = windowed ? allBacklog.slice(offset, offset + (opts.limit ?? allBacklog.length)) : allBacklog;
  return {
    counts: { expeditions: exps.length, iterations: its.length, notes: allNotes.length, backlog: allBacklog.length },
    ...(windowed
      ? {
          notes_window: { offset, shown: notes.length, remaining: Math.max(0, allNotes.length - offset - notes.length) },
          backlog_window: { offset, shown: backlog.length, remaining: Math.max(0, allBacklog.length - offset - backlog.length) },
        }
      : {}),
    expeditions: exps,
    iterations: its,
    notes,
    backlog,
  };
}
