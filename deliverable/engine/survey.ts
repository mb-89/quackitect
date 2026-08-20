// see dsp-the-options-pool.md#what-stands-open
import { byPriority, DEFAULT_PRIORITY, headline, type Priority, pendingNotes, priorityOf, titleOf } from "./inbox.ts";
import { itList, readItRecord } from "./iterations.ts";
import { seDir } from "./paths.ts";
import { standingTokens } from "./pool.ts";
import { expList, readRecord } from "./records.ts";

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

// see dsp-the-options-pool.md#the-finished-set-moved-to-iterations

export function survey(projectRoot: string, opts: SurveyOptions = {}): Survey {
  const exps = expList(projectRoot)
    .filter((e) => e.open)
    .map((e) => ({ id: e.id, goal: goalOf(readRecord(projectRoot, e)) }));
  // A SHIPPED RECORD IS NOT OPEN, whatever its folder says. itList calls a
  // record open when its directory EXISTS, and a close leaves that directory
  // behind — so a shipped record stood in the open list the day after and the
  // desk advised from a count one too high.
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
  // see dsp-the-options-pool.md#the-pool-is-read-from-the-repository
  const allBacklog = standingTokens(projectRoot).map((o) => ({
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
          // PAST THE END, `remaining` MUST NOT READ AS "you have seen it all".
          // With seven standing and an offset of nine it answered shown 0,
          // remaining 0 — which is what a reader gets at the end of a list they
          // have actually walked. Clamping the OFFSET rather than the result
          // keeps the arithmetic honest in both directions.
          notes_window: {
            offset,
            shown: notes.length,
            remaining: Math.max(0, allNotes.length - Math.min(offset, allNotes.length) - notes.length),
          },
          backlog_window: {
            offset,
            shown: backlog.length,
            remaining: Math.max(0, allBacklog.length - Math.min(offset, allBacklog.length) - backlog.length),
          },
        }
      : {}),
    expeditions: exps,
    iterations: its,
    notes,
    backlog,
  };
}
