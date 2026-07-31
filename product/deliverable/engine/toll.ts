// The toll — rebuilt from v2 for v3 (owner rulings 2026-07-26). Work IS
// tool calls, so an agent physically cannot keep working un-narrated: the
// server timestamps the last update; when the window lapses, the next call
// carries ONE grace warning on its result, and the call after an ignored
// warning is refused with the exact resend inline. Payment is any decision-
// graph op riding the `update` field of any call — a volunteered update is
// never stopped, and always resets the window.
//
// TIME IS NOT THE ONLY MEASURE (owner ruling 2026-07-31). A minute of a fast
// harness is fifteen calls; a minute of a slow one is two. Whichever comes
// first is what falls due, so the reader gets the same rhythm on either.
//
// HOW OFTEN IS THE READER'S CHOICE, not the engine's. They watch from a
// different surface on every host, so the cadence is a control they hold, on
// the same bar as the autonomy and the shutdown level. Turned off, nothing is
// ever owed and a volunteered update still lands.
//
// No ETA field, deliberately: hand-typed clock times measured uncalibratable
// in v2 (median ratio 0.01); durations come from the engine's timestamps.
// Armed only after boot — the reading room pays no toll.
import { CLAUSES, Rejection } from "./errors.ts";

/** The UPDATE CADENCE control's five notches. Low narrates hardest; the top
 *  notch owes nothing at all. `ms: 0` is off; `calls: 0` is no call limit. */
export const NARRATION_LEVELS = [
  { value: 1, abbr: "1m", name: "constant — an update every minute, or every 5 calls", ms: 60_000, calls: 5 },
  { value: 2, abbr: "2m", name: "close — an update every 2 minutes, or every 10 calls", ms: 120_000, calls: 10 },
  { value: 3, abbr: "5m", name: "normal — an update every 5 minutes, or every 20 calls", ms: 300_000, calls: 20 },
  { value: 4, abbr: "15m", name: "loose — an update every 15 minutes, or every 60 calls", ms: 900_000, calls: 60 },
  { value: 5, abbr: "off", name: "off — nothing is ever owed; the agent narrates when it chooses", ms: 0, calls: 0 },
];

export const NARRATION_DEFAULT = 3;

export function narrationLevel(value: number): (typeof NARRATION_LEVELS)[number] {
  return NARRATION_LEVELS.find((l) => l.value === value) ?? NARRATION_LEVELS[NARRATION_DEFAULT - 1];
}

export class Toll {
  private readonly fixedWindowMs?: number;
  private readonly now: () => number;
  private readonly level: () => number;
  private armed = false;
  private lastTs = 0;
  private calls = 0;
  private warned = false;
  private pending?: string;

  constructor(opts: { windowMs?: number; now?: () => number; level?: () => number } = {}) {
    if (opts.windowMs !== undefined) this.fixedWindowMs = opts.windowMs;
    this.now = opts.now ?? Date.now;
    this.level = opts.level ?? (() => NARRATION_DEFAULT);
  }

  private minutes(ms: number): number {
    return Math.round(ms / 60000);
  }

  /** What is owed right now. An explicit windowMs (the tests) pins the time
   *  and drops the call limit, so a fixed-window test stays about time. */
  private budget(): { ms: number; calls: number } {
    if (this.fixedWindowMs !== undefined) return { ms: this.fixedWindowMs, calls: 0 };
    const l = narrationLevel(this.level());
    return { ms: l.ms, calls: l.calls };
  }

  /** The dispatch guard. Arms itself on the first call after boot. */
  check(booted: boolean, tool: string, args: Record<string, unknown>): void {
    if (!this.armed) {
      if (booted) {
        this.armed = true;
        this.lastTs = this.now();
        this.calls = 0;
      }
      return;
    }
    this.calls += 1;
    const budget = this.budget();
    if (budget.ms === 0) return; // the control is off — nothing is ever owed
    const silent = this.now() - this.lastTs;
    const overTime = silent > budget.ms;
    const overCalls = budget.calls > 0 && this.calls > budget.calls;
    if (!overTime && !overCalls) return;
    const since = overTime ? `${this.minutes(silent)} min since the last` : `${this.calls} calls since the last`;
    if (!this.warned) {
      // Grace: the first lapsed call proceeds, carrying the warning on its
      // result — only ignoring it earns the refusal (v2 field ruling: a
      // smooth rhythm is never interrupted by a cold toll).
      this.warned = true;
      this.pending = `update overdue (${since}) — the NEXT call without an update field is refused; add update: {op, brief, ...} (any decision-graph op) to any call`;
      return;
    }
    throw new Rejection({
      clause: CLAUSES.TOLL_DUE,
      expected: budget.calls > 0
        ? `an update within ${this.minutes(budget.ms)} min or ${budget.calls} calls of the last`
        : `an update within ${this.minutes(budget.ms)} min of the last`,
      got: `${since}, warning ignored`,
      remedy: {
        tool,
        args: { ...args, update: { op: "update", node: "<the open node you are on — or omit>", brief: "<one line: what you are doing right now>" } },
        note: "pay by resending THIS call with the update field — any op pays: plan {items}, fork {brief}, done|obsolete|revert {node, brief}, note {brief}. A volunteered update is never stopped.",
      },
      source: "engine/toll.ts check",
    });
  }

  /** A valid update landed — the window, the call count and the warning reset. */
  paid(): void {
    this.lastTs = this.now();
    this.calls = 0;
    this.warned = false;
    this.pending = undefined;
  }

  /** The grace warning, if one is due — reading it clears it; the result
   *  decorator attaches it to the next successful response. */
  takeWarning(): string | undefined {
    const w = this.pending;
    this.pending = undefined;
    return w;
  }
}
