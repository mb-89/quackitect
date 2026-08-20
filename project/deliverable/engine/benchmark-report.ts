// see dsp-benchmark-report.md#responsibility
//

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
  /** The state a pull ANSWERED with. Only se_pull carries one. */
  where?: string;
  args?: Record<string, unknown>;
}

function empty(): StateCost {
  return { calls: 0, ms: 0, forms_filled: 0, forms_refilled: 0, refusals_by_clause: {}, entered: 0 };
}

function bucket(out: Record<string, StateCost>, id: string): StateCost {
  const b = out[id] ?? empty();
  out[id] = b;
  return b;
}

/** The clause a refusal names, or undefined. A refusal with no clause is a
 *  crash rather than a typed refusal, and the two must not be added together. */
function clauseOf(outcome: string | undefined): string | undefined {
  return /SE-C-\d+/.exec(outcome ?? "")?.[0];
}

/** THE CARRY-FORWARD RULE. No call record carries a state, so attribution is an
 *  inference: every se_pull answer names its `where`, and every call after it
 *  belongs to that state until the next pull names a different one.
 *
 *  THE NAMING PULL BELONGS TO THE STATE IT NAMES, not to the one it left. It is
 *  the call that did the work of arriving, and charging it backwards would bill
 *  every state for its successor's entry.
 *
 *  WHAT THIS CANNOT SEE is on
 *  raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls. A
 *  call made from somewhere else between two pulls lands on the wrong state,
 *  and nothing in the log distinguishes it. */
export function costPerState(log: CallRecordish[]): Record<string, StateCost> {
  const out: Record<string, StateCost> = {};
  let here: string | undefined;
  let refusedSinceLastForm = false;
  for (const rec of log) {
    if (rec.tool === "se_pull" && typeof rec.where === "string" && rec.where !== "") {
      if (rec.where !== here) {
        here = rec.where;
        bucket(out, here).entered += 1;
        refusedSinceLastForm = false;
      }
    }
    // A CALL BEFORE THE FIRST PULL HAS NO HOME, and inventing one for it would
    // put boot cost on whichever state happened to come first.
    if (here === undefined) continue;
    const b = bucket(out, here);
    b.calls += 1;
    b.ms += rec.duration_ms ?? 0;
    if (rec.ok === false) {
      const clause = clauseOf(rec.outcome);
      if (clause !== undefined) b.refusals_by_clause[clause] = (b.refusals_by_clause[clause] ?? 0) + 1;
    }
    if (rec.tool === "se_pull" && rec.args?.form !== undefined) {
      b.forms_filled += 1;
      // A REFILL IS A FORM SENT AGAIN AFTER ONE WAS REFUSED, which is the
      // number that says how often the machine sent an agent back.
      if (refusedSinceLastForm) b.forms_refilled += 1;
      refusedSinceLastForm = rec.ok === false;
    } else if (rec.ok === false) {
      refusedSinceLastForm = true;
    }
  }
  return out;
}

/** THE EIGHT CONDITIONS a report must carry, in the order the design names
 *  them. A report missing any one is refused rather than recorded. */
export const CONDITIONS = ["iteration", "rewind", "change_size", "rigor_matrix_hash", "se_version", "harness", "model", "effort"] as const;

/** THE TWO FIELDS THAT ARE NOT NUMBERS. Where the run was told to stop, and
 *  where it actually stopped. BOTH are required even when they are equal: a
 *  reader cannot tell "reached the end" from "nobody recorded it" when one of
 *  them is simply absent. */
export const STOP_FIELDS = ["stop_at", "ended_at"] as const;

function missing(report: Record<string, unknown>, key: string): boolean {
  const v = report[key];
  return v === undefined || v === null || String(v).trim() === "";
}

/** One problem per absent field, each naming the field. A run that died still
 *  writes a report, so this is what stops a report that says nothing. */
export function reportProblems(report: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const c of CONDITIONS) {
    if (missing(report, c)) out.push(`${c}: a report without it cannot say what it was taken under`);
  }
  for (const s of STOP_FIELDS) {
    if (missing(report, s)) out.push(`${s}: where a run was told to stop and where it ended are both recorded, even when equal`);
  }
  return out;
}

/** WHAT THE CONDITIONS STAMP COVERS, and it is a SET rather than one hash.
 *
 *  The rigor matrix hash covers `rigor_matrix/rows` and nothing else — read
 *  2026-08-20, and recorded on
 *  raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost. Guidance,
 *  form templates, item templates, method cards and the engine itself all
 *  change what a walk costs and none of them moves that hash.
 *
 *  A REPORT STAMPING THE MATRIX ALONE CLAIMS MORE THAN IT KNOWS: it would call
 *  two runs comparable across exactly the changes this project makes most
 *  often. */
export function conditionsStampDirs(): string[] {
  return [
    "project/deliverable/engine",
    "project/deliverable/machines/forms",
    "project/deliverable/machines/items",
    "project/deliverable/machines/methods",
    "project/deliverable/machines/rigor_matrix/rows",
    "project/guidance",
  ];
}
