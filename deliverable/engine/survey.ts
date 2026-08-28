// see dsp-the-options-pool.md#what-stands-open
import { byPriority, DEFAULT_PRIORITY, headline, type Priority, pendingNotes, priorityOf, titleOf } from "./inbox.ts";
import { itList, readItRecord } from "./iterations.ts";
import { seDir } from "./paths.ts";
import { standingTokens } from "./pool.ts";
import { expList, readRecord, retroOwed } from "./records.ts";
import { openRegisterWork } from "./register.ts";
import { BACKLOG } from "./workstore.ts";

export interface Survey {
  counts: { expeditions: number; iterations: number; notes: number; backlog: number };
  /** SHIPPED RECORDS THAT STILL OWE A RETRO, read from the repository rather
   *  than from the local note store. A clone that never held the notes can see
   *  this, which is the whole point: an empty inbox and an inbox that was never
   *  here used to give the same answer. */
  retro_owed?: string[];
  expeditions: { id: string; goal: string }[];
  iterations: { id: string; goal: string }[];
  notes: { ref: string; at: string; title: string; priority: Priority; text?: string }[];
  backlog: { ref: string; ready_when: string; title: string; priority: Priority; text?: string }[];
  /** Present whenever the notes list was WINDOWED, so a paged answer can
   *  never be mistaken for the whole inbox. */
  notes_window?: { offset: number; shown: number; remaining: number };
  /** The backlog windows WITH the notes — one limit, both lists. It once
   *  rode along whole on every windowed call and overflowed the host
   *  (, at 44 parked items). */
  backlog_window?: { offset: number; shown: number; remaining: number };
  /** BACKLOG ITEMS WAITING FOR A MOMENT THAT HAS ALREADY COME AND GONE.
   *
   *  A re-entry condition naming a record is a promise that the item wakes
   *  when that record opens. Nothing wakes it, so it waits until somebody
   *  happens to read the backlog at the right hour, and usually nobody does.
   *
   *  MEASURED: sixteen items named the walk-speed record. It
   *  shipped four days earlier and collected none of them. Twenty-four in
   *  total named a record that was shipped or abandoned, one of them naming a
   *  record abandoned outright, so its moment can never arrive at all.
   *
   *  WHAT THIS CANNOT SEE is a condition written in prose — "when the panel
   *  round opens" names no id, so nothing mechanical can resolve it. Those
   *  are found by reading. This catches the ones that name an id, which was
   *  the majority of the twenty-four. */
  passed_moments?: { ref: string; names: string; status: string; ready_when: string }[];
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

/** Backlog items whose re-entry condition names a record that is no longer
 *  open. see Survey.passed_moments for what this is for and cannot see. */
function passedMoments(
  records: { id: string; open: boolean; status: string }[],
  backlog: { ref: string; ready_when: string }[],
): { ref: string; names: string; status: string; ready_when: string }[] {
  // A CONDITION NAMES A RECORD BY ITS NUMBER, never by its whole folder name.
  // "ready when i60 is seeded" is what an author writes, so the short form is
  // what has to resolve.
  const byNumber = new Map<string, { id: string; open: boolean; status: string }>();
  for (const r of records) {
    const n = /^i(\d+)-/.exec(r.id)?.[1];
    if (n !== undefined) byNumber.set(`i${n}`, r);
  }
  const out: { ref: string; names: string; status: string; ready_when: string }[] = [];
  for (const item of backlog) {
    for (const m of item.ready_when.matchAll(/\bi(\d+)\b/g)) {
      const rec = byNumber.get(`i${m[1]}`);
      if (rec === undefined || rec.open) continue;
      out.push({ ref: item.ref, names: rec.id, status: rec.status, ready_when: item.ready_when });
      break;
    }
  }
  return out;
}

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
  //
  // AN ITEM WITH A PLACE IS NOT IN THE BACKLOG ANY MORE, and the desk has to
  // read that. Writing a place moved 300 of 352 items onto a record or a state,
  // and the desk went on listing all 352 — because this line
  // took every standing token and never asked where any of them stood.
  //
  // THE PLACE WAS ALREADY BEING READ ELSEWHERE. `workpen.ts` draws an item at
  // its place. So the field was right, the store was right, and the one
  // surface a person actually reads was the one that ignored it.
  //
  // WHERE THE OTHERS WENT is the state's own pending work, which is what
  // holding a place means.
  // TWO SOURCES SIT IN THE BACKLOG AND THE DESK LISTED ONE.
  //
  // workpen.ts draws BOTH pool tokens and open register entries at the backlog,
  // and the board's pill counts what the pen draws. This list read the pool
  // alone, so the pill said 42 while the list showed 23. The 19 that never
  // appeared were open issues and debts, which are the oldest work there is.
  // Measured.
  //
  // THE PEN IS THE AUTHORITY ON WHERE WORK STANDS. This reads the same two
  // sources, filtered the same way, so the count and the list are one set
  // rather than two answers a reader has to reconcile.
  //
  // A REGISTER ENTRY'S TRIGGER IS ITS READY-WHEN. Both answer the same question,
  // which is what has to happen before somebody looks again, so the list
  // carries one column rather than two named after where a row came from.
  const atBacklog = (place: string | undefined): boolean => place === undefined || place === "" || place === BACKLOG;
  const allBacklog = [
    ...standingTokens(projectRoot)
      .filter((o) => atBacklog(o.place))
      .map((o) => ({ ref: o.id, ready_when: o.ready_when, statement: o.statement })),
    ...openRegisterWork(projectRoot)
      .filter((e) => atBacklog(e.place))
      .map((e) => ({ ref: e.id, ready_when: e.trigger, statement: e.statement })),
  ].map((o) => ({
    ref: o.ref,
    ready_when: o.ready_when,
    title: headline(o.statement, GOAL_CAP),
    priority: DEFAULT_PRIORITY,
    ...(withText ? { text: o.statement } : {}),
  }));
  const backlog = windowed ? allBacklog.slice(offset, offset + (opts.limit ?? allBacklog.length)) : allBacklog;
  const passed = passedMoments(itList(projectRoot), allBacklog);
  // READ FROM THE REPOSITORY, never from the local note store. Shipping used to
  // say this in a note, and a note dies with the box that held it.
  const owedRetros = retroOwed(projectRoot);
  return {
    counts: { expeditions: exps.length, iterations: its.length, notes: allNotes.length, backlog: allBacklog.length },
    ...(owedRetros.length > 0 ? { retro_owed: owedRetros } : {}),
    ...(passed.length > 0 ? { passed_moments: passed } : {}),
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
