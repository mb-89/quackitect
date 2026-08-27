// see dsp-the-work-offer.md#responsibility
//
// TWO READS, BOTH ON THE HOT PATH: what a hand may take now, and how much a
// position still owes.
//
// THIS MODULE WRITES NOTHING. That is the cut, and it is sharper than a
// read-against-write split because it is true.
import { isSettled, type ReadCredit, readWorkReporting, type WorkItem } from "./workstore.ts";

/** The two slots a count is kept per. Derived from where the work came from,
 *  never stored beside it. */
export type Slot = "take_in" | "produce";

/** A figure a surface draws.
 *
 *  EVERY DRAWN VALUE SAYS WHETHER IT IS A SNAPSHOT OR A LIVE READING, and one
 *  carrying neither cannot be built — the type has no third state.
 *
 *  A COUNT THAT CANNOT BE PRODUCED IS ABSENT, never zero. A zero and an unknown
 *  look identical on a surface and mean opposite things, so `value` is null and
 *  `why` says what stopped it. */
export interface Drawn {
  value: number | null;
  basis: "live" | "snapshot";
  why: string;
}

export interface Withheld {
  item: WorkItem;
  why: string;
}

export interface Offer {
  offered: WorkItem[];
  withheld: Withheld[];
  /** REPORTED, never skipped. see dsp-the-work-offer.md#failure-behaviour */
  unreadable: { path: string; why: string }[];
}

/** Which slot a piece of work belongs to.
 *
 *  Reading is what a position takes IN. Everything else is what it PRODUCES. */
export function slotOf(item: WorkItem): Slot {
  return item.source === "reading" ? "take_in" : "produce";
}

/** THE FOUR BUCKETS live with the item, because the store RENDERS the answer
 *  into every token's frontmatter and cannot import this module to do it. */
export { type Bucket, bucketOf } from "./workstore.ts";

/** Whether a position has finished, which is ONE FACT rather than a list.
 *
 *  A position has no outcome of its own; it finishes when everything placed
 *  there is settled or has moved on. */
export function positionFinished(items: WorkItem[], position: string): boolean {
  return items.every((i) => i.place !== position || isSettled(i));
}

/** What a position still owes, one figure per slot.
 *
 *  see dsp-the-work-offer.md#why-the-count-is-not-on-the-write-path — every look
 *  at a position counts, and only entering one mints, so this is a read. */
export function owed(home: string, position: string, isRead?: ReadCredit): { take_in: Drawn; produce: Drawn } {
  const read = readWorkReporting(home, isRead);
  return owedFrom(read, position);
}

/** The same count over work the caller HAS ALREADY READ.
 *
 *  A card drawing one block per position called `owed` per block, and each call
 *  re-read the whole folder after the card had read it once. Passing the input
 *  down is the version of a cache that cannot be wrong. */
export function owedFrom(
  { items, unreadable }: { items: WorkItem[]; unreadable: { path: string; why: string }[] },
  position: string,
): { take_in: Drawn; produce: Drawn } {
  if (unreadable.length > 0) {
    const why = `${unreadable.length} piece(s) of work here cannot be read: ${unreadable.map((u) => u.path).join(", ")}`;
    return { take_in: { value: null, basis: "live", why }, produce: { value: null, basis: "live", why } };
  }
  const here = items.filter((i) => i.place === position && !isSettled(i));
  return {
    take_in: { value: here.filter((i) => slotOf(i) === "take_in").length, basis: "live", why: "" },
    produce: { value: here.filter((i) => slotOf(i) === "produce").length, basis: "live", why: "" },
  };
}

/** A STORED COPY NEVER BEATS A DERIVED ONE, and the disagreement is REPORTED
 *  rather than silently corrected. */
export function reconcile(
  home: string,
  position: string,
  stored: { take_in: number; produce: number },
): {
  live: { take_in: Drawn; produce: Drawn };
  disagreements: string[];
} {
  const live = owed(home, position);
  const disagreements: string[] = [];
  for (const slot of ["take_in", "produce"] as const) {
    const drawn = live[slot];
    if (drawn.value !== null && drawn.value !== stored[slot]) {
      disagreements.push(`${slot}: the stored count says ${stored[slot]} and the work says ${drawn.value}`);
    }
  }
  return { live, disagreements };
}

/** Whether standing work holds the walk at a position.
 *
 *  EMERGENCY LIFTS IT ENTIRELY, and it still reports what is open.
 *  see dsp-the-work-offer.md#emergency-lifts-the-work-gate */
export function leavingHeldBy(
  home: string,
  position: string,
  emergency: boolean,
  isRead?: ReadCredit,
): { held: boolean; why: string; open: WorkItem[] } {
  const open = openPointsAt(home, position, isRead);
  if (emergency) return { held: false, why: "emergency is armed, so work does not hold the walk", open };
  if (open.length === 0) return { held: false, why: "", open };
  return {
    held: true,
    why: `${open.length} piece(s) of work here are neither settled nor moved on: ${open.map((i) => i.statement).join(", ")}`,
    open,
  };
}

/** What is still open at a position, so a checkpoint can rule on it.
 *
 *  A point cannot be carried indefinitely by nobody looking, and this is what
 *  the sweep reads.
 *
 *  PENDING IS NOT AMONG IT. The pending bucket holds work the position is meant
 *  to do something with eventually, and it does not block.
 *  It is really for the backlog, which is SHOWN at the front desk without being
 *  owed there — so a pending item that held the walk would make the desk
 *  impossible to leave.
 *  see dsp-the-bucket-editor.md#it-does-not-block */
export function openPointsAt(home: string, position: string, isRead?: ReadCredit): WorkItem[] {
  return readWorkReporting(home, isRead).items.filter((i) => i.place === position && i.slot !== "pending" && !isSettled(i));
}
