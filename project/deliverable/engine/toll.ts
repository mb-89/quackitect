// The toll — the narration floor. see dsp-narration.md#the-toll
//
import { CLAUSES, Rejection } from "./errors.ts";

/** see dsp-narration.md#the-cadence-is-the-readers-control */
export const NARRATION_DEFAULT_MINUTES = 5;
export const NARRATION_DEFAULT_CALLS = 20;

export class Toll {
  private readonly fixedWindowMs?: number;
  private readonly now: () => number;
  private readonly cadence: () => { minutes: number; calls: number };
  private armed = false;
  private lastTs = 0;
  private calls = 0;
  private warned = false;
  private pending?: string;

  constructor(opts: { windowMs?: number; now?: () => number; cadence?: () => { minutes: number; calls: number } } = {}) {
    if (opts.windowMs !== undefined) this.fixedWindowMs = opts.windowMs;
    this.now = opts.now ?? Date.now;
    this.cadence = opts.cadence ?? (() => ({ minutes: NARRATION_DEFAULT_MINUTES, calls: NARRATION_DEFAULT_CALLS }));
  }

  private minutes(ms: number): number {
    return Math.round(ms / 60000);
  }

  /** What is owed right now. An explicit windowMs (the tests) pins the time
   *  and drops the call limit, so a fixed-window test stays about time. */
  private budget(): { ms: number; calls: number } {
    if (this.fixedWindowMs !== undefined) return { ms: this.fixedWindowMs, calls: 0 };
    const c = this.cadence();
    return { ms: c.minutes * 60_000, calls: c.calls };
  }

  /** A hop the machine forced, which pays no call.
   *
   *  TWO SHAPES, AND ONE ARGUMENT COVERS BOTH. The machine forced the hop, no
   *  judgment happened on it, and a toll falling due there could only ever be
   *  paid with filler.
   *
   *  see dsp-narration.md#the-reading-loop-pays-nothing */
  private static isReadingHop(tool: string, args: Record<string, unknown>): boolean {
    // WAITING ON A JOB YOU ALREADY STARTED IS THE SAME SHAPE AS THE READING
    // LOOP. The battery runs asynchronously and hands back a handle, so the
    // only way to learn it finished is to ask — and asking is not work.
    //
    // MEASURED on the i15 walk: se_test was called 40 times. The 4 that
    // STARTED a run were never refused. Of the 36 that polled a running job,
    // 25 were refused by this toll — 62% of every se_test call in the
    // session, none of them about testing. Each one had to be paid with an
    // update saying nothing, or resent until it was.
    if (tool === "se_test") return typeof args.job === "string" && args.job !== "";
    if (tool !== "se_pull") return false;
    const form = args.form as Record<string, unknown> | undefined;
    if (form === undefined || form.read === undefined) return false;
    // ONLY a proof. A pull carrying evidence or a choice beside it is doing
    // real work and pays like anything else.
    return Object.keys(form).length === 1;
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
    if (Toll.isReadingHop(tool, args)) return;
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
      expected:
        budget.calls > 0
          ? `an update within ${this.minutes(budget.ms)} min or ${budget.calls} calls of the last`
          : `an update within ${this.minutes(budget.ms)} min of the last`,
      got: `${since}, warning ignored`,
      remedy: {
        tool,
        args: {
          ...args,
          update: {
            op: "update",
            node: "<an OPEN node id — required while a checklist stands>",
            brief: "<one line: what you are doing right now>",
          },
        },
        note: "pay by resending THIS call with the update field — the ops: plan {items}, fork {brief}, done|obsolete|revert {node, brief}, update {node, brief}. A volunteered update is never stopped.",
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
