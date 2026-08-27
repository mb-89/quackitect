// see dsp-the-work-store.md#work-drawn-from-a-live-source
//
// THE PEN IS DRAWN, NEVER MINTED. Two stores already hold work in their own
// shape, and neither can be migrated into the work store without losing what
// makes it what it is: a raw note must stay local, and a pool token must stay
// on trunk where every clone reads the same answer.
//
// SO THE WORK IS DERIVED ON EVERY LOOK, which is the house rule for a value
// that can be computed. Nothing is written, so nothing can drift, and work
// disappears the moment its source does.
//
// THIS MODULE WRITES NOTHING, the same cut workoffer.ts makes.
import { statSync } from "node:fs";
import { join } from "node:path";
import { pendingNotes, titleOf } from "./inbox.ts";
import { seDir } from "./paths.ts";
import { POOL_PREFIX, poolDir, standingTokens } from "./pool.ts";
import { isRegisterEntry, openRegisterWork, RAID_PREFIX, raidDir } from "./register.ts";
import { BACKLOG, type WorkItem } from "./workstore.ts";

/** THE STATE A PENDING NOTE IS DRAWN AT.
 *
 *  Draining is legal at the retro and the retro says so itself: "This state is
 *  the ONE place draining is legal." So the retro is the one position that owes
 *  a note, and drawing it anywhere else would count it twice.
 *
 *  IT IS A NAME, NOT A PLACE, exactly as the backlog's is. Nothing is stored,
 *  and the note store stays the truth about what pends. */
export const NOTES_ARE_DRAWN_AT = "retro";

/** WHETHER AN ID WAS DRAWN RATHER THAN MINTED.
 *
 *  A drawn item has no file, so no act that names a home can touch it. The
 *  refusal is worth more than a silent miss: a settle that wrote nowhere would
 *  look exactly like a settle that worked. */
export function isDrawn(id: string): boolean {
  return id.startsWith("note-") || id.startsWith("wt-") || isRegisterEntry(id);
}

/** THE ACT THAT ACTUALLY ENDS A DRAWN PIECE OF WORK, named so a refusal can
 *  hand it back instead of only saying no. */
export function drawnEndsWith(id: string): string {
  if (id.startsWith("note-")) return "se_note_drain";
  // A REGISTER ENTRY CLOSES ON ITS OWN FACE. Its status is the truth about
  // whether it stands, so the act is an edit to the node rather than a verb of
  // the work store's.
  if (isRegisterEntry(id)) return "se_file_patch";
  return "se_seed_iteration";
}

function drawn(at: { id: string; statement: string; place: string; sourceRef: string; slot: string; body: string }): WorkItem {
  return {
    id: at.id,
    statement: at.statement,
    step: "",
    source: "pen",
    source_ref: at.sourceRef,
    origin: at.place,
    place: at.place,
    status: "open",
    reason: "",
    taken_by: "",
    took_comment: "",
    // NOTHING IS WRITTEN, so nothing travels. `state` is the honest answer:
    // this item does not outlive the source it was read from.
    lifetime: "state",
    person_only: false,
    bucket: "",
    slot: at.slot,
    group: "",
    part_of: "",
    parts: [],
    after: [],
    difficulty: "",
    opened: "",
    closed: "",
    body: at.body,
  };
}

/** EVERY PIECE OF WORK THE TWO LIVE SOURCES HOLD.
 *
 *  A PENDING NOTE IS THE RETRO'S OUTPUT (owner). Draining the inbox is what a
 *  retro PRODUCES, and the retro cannot be left until it is done — so the note
 *  belongs in the bucket that blocks, not the one that does not.
 *
 *  IT USED TO DRAW AS PENDING, and pending is the one bucket that never takes a
 *  green away. That made the count a display with no consequence: 86 notes
 *  could stand at the retro and the retro read finished.
 *
 *  THE GREY IS THE POINT AND IT IS BOUNDED. Green is refused over the state and
 *  everything downstream of it IN ITS OWN MACHINE, and the retro is a machine of
 *  its own. The main line is not held by an undrained inbox; the retro is.
 *
 *  A STANDING POOL TOKEN IS STILL PENDING. Its place is the backlog, and the
 *  backlog is the front desk's pending bucket, so it draws there and blocks
 *  nothing. Nobody owes the pool anything today.
 *
 *  THE RAW NOTE NEVER TRAVELS. Only the note's own title crosses, which is what
 *  the feed and the survey already show. */
export function penWork(root: string): WorkItem[] {
  const out: WorkItem[] = [];
  for (const n of pendingNotes(seDir(root))) {
    out.push(drawn({ id: n.ref, statement: titleOf(n), place: NOTES_ARE_DRAWN_AT, sourceRef: n.ref, slot: "out", body: "" }));
  }
  for (const t of standingTokens(root)) {
    out.push(
      drawn({ id: t.id, statement: t.statement, place: BACKLOG, sourceRef: `${POOL_PREFIX}/${t.id}.md`, slot: "", body: t.ready_when }),
    );
  }
  // AN OPEN ISSUE OR DEBT IS WORK NOBODY HAS PLACED, so it draws where work
  // nobody has placed belongs. Its TRIGGER is its re-entry condition, which is
  // the same field a pool token calls ready_when.
  for (const e of openRegisterWork(root)) {
    out.push(
      drawn({ id: e.id, statement: e.statement, place: BACKLOG, sourceRef: `${RAID_PREFIX}/${e.id}.md`, slot: "", body: e.trigger }),
    );
  }
  return out;
}

/** THE PEN'S OWN SIGNAL, so a change to a live source repaints the drawing.
 *
 *  THE PILLS ARE PUSHED, NOT POLLED, and the push fires on a number moving. The
 *  store's signal stats the work folders and the pen has none, so capturing a
 *  note moved the retro's count on disk and left the drawing sitting still.
 *
 *  IT IS A STAT, NEVER A READ, exactly as the store's is. The note log is one
 *  file and the pool is a folder of them, and both answer in one syscall each.
 *
 *  THE POOL'S FOLDER MTIME IS ENOUGH FOR IT. A token is minted or it is not;
 *  nothing rewrites one in place, which is the case the store has to stat
 *  per-file to catch. */
export function penSignal(root: string): number {
  let sum = 0;
  for (const p of [join(seDir(root), "notes.jsonl"), poolDir(root), raidDir(root)]) {
    try {
      const s = statSync(p);
      sum += s.size + s.mtimeMs;
    } catch {
      // An absent source is a signal of zero, never a thrown render.
    }
  }
  return sum;
}
