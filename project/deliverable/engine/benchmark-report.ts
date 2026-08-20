// see dsp-benchmark-report.md#responsibility
//
// NOT BUILT YET — see the note in benchmark.ts. Neutral answers on purpose.

export interface StateCost {
  calls: number;
  ms: number;
  forms_filled: number;
  forms_refilled: number;
  refusals_by_clause: Record<string, number>;
  entered: number;
}

export interface CallRecordish {
  ts?: number;
  tool?: string;
  ok?: boolean;
  outcome?: string;
  duration_ms?: number;
  where?: string;
}

/** THE CARRY-FORWARD RULE. No call record carries a state; every se_pull answer
 *  names its `where`, so the log is walked in order and each call is attributed
 *  to the state the last pull named. */
export function costPerState(_log: CallRecordish[]): Record<string, StateCost> {
  return {};
}

/** The eight conditions plus the two stop fields. A report missing any of them
 *  is refused rather than recorded. */
export function reportProblems(_report: Record<string, unknown>): string[] {
  return [];
}

/** WHAT THE CONDITIONS STAMP COVERS. It is a SET, not one hash: the matrix
 *  alone misses guidance, forms, items, methods and the engine, all of which
 *  change walk cost. */
export function conditionsStampDirs(): string[] {
  return [];
}
