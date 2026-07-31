// WHAT STANDS OPEN — one mechanical answer: open expeditions, open
// iterations, pending notes, and parked backlog items with their ready-when.
//
// BOTH HANDS ASK IT (owner ruling 2026-07-28). The agent calls se_survey;
// the person clicks it in the mirror. It lived inside the tool handler and
// so was reachable only by the agent, which made "what is open" a question
// the owner had to route through someone else. One implementation, two
// doors.
import { backlogNotes, pendingNotes, readNotes } from "./inbox.ts";
import { expList, readRecord } from "./worktree.ts";
import { itList, readItRecord } from "./iterations.ts";
import { seDir } from "./paths.ts";

export interface Survey {
  counts: { expeditions: number; iterations: number; notes: number; backlog: number };
  expeditions: { id: string; goal: string }[];
  iterations: { id: string; goal: string }[];
  notes: { ref: string; at: string; text: string }[];
  backlog: { ref: string; ready_when: string; text: string }[];
  /** Present whenever the notes list was WINDOWED, so a paged answer can
   *  never be mistaken for the whole inbox. */
  notes_window?: { offset: number; shown: number; remaining: number };
}

export interface SurveyOptions {
  /** brief returns each note's opening PARAGRAPH instead of its whole text.
   *  Full is the default and stays so (owner ruling 2026-07-29) — a survey
   *  that shows titles cannot weigh content, which is what both the desk and
   *  the retro open by doing. brief is the flag that ruling allowed for, not
   *  a return to truncation. */
  detail?: "full" | "brief";
  /** A window over the NOTES list — the only part that grows without bound.
   *  Answering in full was right and is not enough on its own: at 43 pending
   *  notes the whole survey ran past the token ceiling and was written where
   *  the lane could not read it. Counts stay complete, so a window never
   *  hides how much there is. */
  limit?: number;
  offset?: number;
}

/** The opening paragraph, not the opening LINE. Every note starts with a
 *  heading and puts its substance underneath, so a line is always the title
 *  and never the point. */
const firstParagraph = (t: string): string => t.split(/\n\s*\n/)[0].trim();

// IT ANSWERS IN FULL (owner ruling 2026-07-29). Every field used to pass
// through a first-line-then-120-characters cut. Notes open with a heading
// line and carry their substance below it, so the survey reliably showed a
// title and discarded the content — and cut the title mid-word.
//
// The tell was ready_when: the field saying WHEN a note comes back was
// complete while the field saying WHAT it is was not. Both hands weigh the
// inbox through this call and nothing else can read a note, so a cut here
// is the whole view.
// A record that will not parse is SHOWN as unreadable, never as an empty
// goal. An empty goal reads as an expedition nobody bothered to describe;
// the truth is a broken file, and only the truth gets it fixed.
const goalOf = (fm: Record<string, unknown> | undefined): string =>
  fm?.unreadable !== undefined ? `⚠ ${String(fm.unreadable)}` : String(fm?.goal ?? "");

export function survey(projectRoot: string, opts: SurveyOptions = {}): Survey {
  const exps = expList(projectRoot).filter((e) => e.open).map((e) => ({ id: e.id, goal: goalOf(readRecord(projectRoot, e)) }));
  const its = itList(projectRoot).filter((i) => i.open).map((i) => ({ id: i.id, goal: goalOf(readItRecord(projectRoot, i)) }));
  const allNotes = pendingNotes(seDir(projectRoot)).map((n) => ({ ref: n.ref, at: n.at, text: opts.detail === "brief" ? firstParagraph(n.text) : n.text }));
  const offset = Math.max(0, opts.offset ?? 0);
  const windowed = opts.limit !== undefined || offset > 0;
  const notes = windowed ? allNotes.slice(offset, offset + (opts.limit ?? allNotes.length)) : allNotes;
  const backlog = backlogNotes(seDir(projectRoot)).map((n) => ({ ref: n.ref, ready_when: n.drained?.where ?? "", text: n.text }));
  return {
    counts: { expeditions: exps.length, iterations: its.length, notes: allNotes.length, backlog: backlog.length },
    ...(windowed ? { notes_window: { offset, shown: notes.length, remaining: Math.max(0, allNotes.length - offset - notes.length) } } : {}),
    expeditions: exps,
    iterations: its,
    notes,
    backlog,
  };
}
