// The toll — rebuilt from v2 for v3 (owner rulings 2026-07-26). Work IS
// tool calls, so an agent physically cannot keep working un-narrated: the
// server timestamps the last update; when the window lapses, the next call
// carries ONE grace warning on its result, and the call after an ignored
// warning is refused with the exact resend inline. Payment is any decision-
// graph op riding the `update` field of any call — a volunteered update is
// never stopped, and always resets the window.
//
// No ETA field, deliberately: hand-typed clock times measured uncalibratable
// in v2 (median ratio 0.01); durations come from the engine's timestamps.
// Armed only after boot — the reading room pays no toll.
import { CLAUSES, Rejection } from "./errors.ts";

export class Toll {
  private readonly windowMs: number;
  private readonly now: () => number;
  private armed = false;
  private lastTs = 0;
  private warned = false;
  private pending?: string;

  constructor(opts: { windowMs?: number; now?: () => number } = {}) {
    this.windowMs = opts.windowMs ?? 5 * 60 * 1000;
    this.now = opts.now ?? Date.now;
  }

  private minutes(ms: number): number {
    return Math.round(ms / 60000);
  }

  /** The dispatch guard. Arms itself on the first call after boot. */
  check(booted: boolean, tool: string, args: Record<string, unknown>): void {
    if (!this.armed) {
      if (booted) {
        this.armed = true;
        this.lastTs = this.now();
      }
      return;
    }
    const silent = this.now() - this.lastTs;
    if (silent <= this.windowMs) return;
    if (!this.warned) {
      // Grace: the first lapsed call proceeds, carrying the warning on its
      // result — only ignoring it earns the refusal (v2 field ruling: a
      // smooth rhythm is never interrupted by a cold toll).
      this.warned = true;
      this.pending = `update overdue (${this.minutes(silent)} min since the last) — the NEXT call without an update field is refused; add update: {op, brief, ...} (any decision-graph op) to any call`;
      return;
    }
    throw new Rejection({
      clause: CLAUSES.TOLL_DUE,
      expected: `an update within ${this.minutes(this.windowMs)} min of the last`,
      got: `last update ${this.minutes(silent)} min ago, warning ignored`,
      remedy: {
        tool,
        args: { ...args, update: { op: "note", node: "<the open node you are on — or omit>", brief: "<one line: what you are doing right now>" } },
        note: "pay by resending THIS call with the update field — any op pays: plan {items}, fork {brief}, done|obsolete|revert {node, brief}, note {brief}. A volunteered update is never stopped.",
      },
      source: "engine/toll.ts check",
    });
  }

  /** A valid update landed — the window and the warning reset. */
  paid(): void {
    this.lastTs = this.now();
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
