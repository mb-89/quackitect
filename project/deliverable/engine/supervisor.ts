// THE SATELLITE SUPERVISOR (dsp-satellite-lifecycle, el-satellite-supervisor).
//
// Four all-or-nothing acts over a satellite's life: START, WATCH, REPLACE,
// REAP. A partial one never serves.
//
// THIS FILE CARRIES THE TWO THE BUILD NEEDS FIRST — levelling at start, and
// replacing without losing the composition that was working. WATCH's numbers
// live here too, measured rather than chosen.
import { overridesIn } from "./delta.ts";

/** The git work levelling needs, injected so the logic is testable without a
 *  repository. The real one wraps the git lane. */
export interface GitLane {
  /** Rebase the record's delta onto trunk. */
  rebase(recordRel: string): { ok: boolean; conflict?: string };
  /** Commit whatever the levelling brought into the record's tree. */
  commit(recordRel: string, message: string): { ok: boolean };
}

export interface LevelResult {
  /** True only when the tree is level AND what it brought is committed. */
  levelled: boolean;
  /** Named when the record stops at entry rather than serving. */
  conflict?: string;
  /** What this record overrides, which is what levelling had to rebase. */
  overrides: string[];
}

/** START, and it is all-or-nothing.
 *
 *  Level the record's tree, rebase its delta on trunk, commit what was
 *  brought, and only then serve. A conflict stops the record at entry with
 *  the conflict NAMED, rather than composing a mixture nobody assembled.
 *
 *  NOTHING IS IN FLIGHT AT A START, so a partial levelling cannot be
 *  observed: it either comes up level or does not come up. That is the whole
 *  reason this act sits at start rather than mid-walk.
 *
 *  THE COST IS MEASURED. exp-satellite-start puts a start at 306.9 ms with
 *  the engine module load included, against a one-second budget — affordable
 *  only because it happens when a RECORD OPENS and never inside a call. */
export function levelRecordTree(root: string, recordRel: string, git: GitLane): LevelResult {
  const overrides = overridesIn(root, recordRel);

  // A record that overrides nothing has nothing to rebase, and trunk moving
  // under it is not a conflict. Most records are this one.
  if (overrides.length === 0) return { levelled: true, overrides };

  const rebased = git.rebase(recordRel);
  if (!rebased.ok) {
    // THE FOURTH CELL OF THE TABLE: an override that no longer applies to the
    // trunk file beneath it. Reported, never merged.
    return {
      levelled: false,
      conflict: rebased.conflict ?? "the record's delta would not rebase on trunk",
      overrides,
    };
  }

  const committed = git.commit(recordRel, "level: what the record brought");
  if (!committed.ok) return { levelled: false, conflict: "the levelled tree would not commit", overrides };

  return { levelled: true, overrides };
}

/** REPLACE, with the property nginx has and this element lacked.
 *
 *  nginx.org/en/docs/control.html: on HUP the master "first checks the syntax
 *  validity, then tries to apply new configuration... If this fails, it rolls
 *  back changes and continues to work with old configuration."
 *
 *  raid-risk-a-broken-engine-delta-has-no-way-back is what happens without
 *  it: a delta that rebases cleanly and then fails to RUN takes the lane with
 *  it, and the lane is the only door to the file that broke it.
 *
 *  So the previous composition is retired only after the replacement is
 *  known to load. */
export function replaceComposition<T>(
  current: T,
  next: () => T,
  validate: (candidate: T) => { ok: boolean; why?: string },
): { serving: T; replaced: boolean; why?: string } {
  let candidate: T;
  try {
    candidate = next();
  } catch (e) {
    return { serving: current, replaced: false, why: `the replacement would not compose: ${String((e as Error).message)}` };
  }
  const verdict = validate(candidate);
  if (!verdict.ok) return { serving: current, replaced: false, why: verdict.why ?? "the replacement did not validate" };
  return { serving: candidate, replaced: true };
}

/** WATCH's three numbers, measured rather than chosen.
 *
 *  exp-inflight-death: three break kinds all reach the caller as ECONNRESET
 *  inside 100 ms, and a crash is the slowest at 94.1 ms.
 *  exp-watchdog: a satellite whose event loop stays free answers 8 of 8 beats
 *  while its call never returns, so the beat alone reports the likelier hang
 *  as healthy. The DEADLINE is the mechanism; the beat is an addition. */
export const WATCH = {
  /** Above 94 ms, because that is how long a crash took to reach the caller.
   *  Anything tighter would call a crash a hang. */
  deadlineMs: 30_000,
  /** How often the core asks a satellite whether it is still there. */
  beatMs: 200,
  /** Missed beats before a wedge is declared. Three at 200 ms is 600 ms. */
  allowance: 3,
} as const;

/** Is this deadline safe against the measured worst case? */
export const deadlineIsSafe = (ms: number): boolean => ms > 94;

/** What a call did, as the caller observed it.
 *
 *  DETECTION IS FREE AND NEEDS NO PROTOCOL. exp-inflight-death measured three
 *  break kinds — exit, crash and outside kill — all reaching the caller as one
 *  observable end state inside 100 ms. So a death is REPORTED here rather than
 *  timed, and the deadline is left to catch the thing that announces nothing. */
export type CallEnd = { kind: "answered"; ms: number } | { kind: "died"; ms: number } | { kind: "pending"; ms: number };

export interface WatchVerdict {
  state: "alive" | "dead" | "wedged";
  /** Named whenever the satellite is not alive. A verdict without a reason is
   *  a diagnosis nobody can act on. */
  why?: string;
}

/** WATCH, first half: THE DEADLINE ON THE CALL, and it is THE MECHANISM.
 *
 *  A death announces itself. A HANG does not: exp-watchdog measured a
 *  satellite whose event loop stayed free answering 8 of 8 beats while its
 *  call never returned. The beat called that healthy. Only the deadline sees
 *  it. */
export function callVerdict(end: CallEnd, deadlineMs: number = WATCH.deadlineMs): WatchVerdict {
  if (end.kind === "died") return { state: "dead", why: `the satellite died ${end.ms} ms into the call` };
  if (end.kind === "answered") return { state: "alive" };
  if (end.ms >= deadlineMs) {
    return { state: "wedged", why: `the call passed its ${deadlineMs} ms deadline without answering or dying` };
  }
  return { state: "alive" };
}

/** How many beats have gone unanswered, read off the CLOCK rather than a timer.
 *
 *  `now` is passed in, so the logic is testable without waiting and the caller
 *  owns the schedule. One whole interval with no beat counts as one missed. */
export function missedBeats(lastBeatAt: number, now: number, beatMs: number = WATCH.beatMs): number {
  if (beatMs <= 0) return 0;
  const elapsed = now - lastBeatAt;
  return elapsed <= 0 ? 0 : Math.floor(elapsed / beatMs);
}

/** WATCH, second half: THE BEAT ON THE PROCESS.
 *
 *  It is an ADDITION to the deadline, never a replacement, and it earns its
 *  place on two narrow things dsp-satellite-lifecycle names:
 *
 *  - it finds a blocked loop in 600 ms, where a generous deadline takes
 *    seconds;
 *  - it sees a wedge while the satellite is IDLE, which no deadline can,
 *    because an idle satellite has no call to time. */
export function beatVerdict(missed: number, allowance: number = WATCH.allowance): WatchVerdict {
  if (missed >= allowance) {
    return { state: "wedged", why: `${missed} beats missed and the allowance is ${allowance}` };
  }
  return { state: "alive" };
}
