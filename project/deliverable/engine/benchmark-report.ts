// see dsp-benchmark-report.md#responsibility

export interface StateCost {
  calls: number;
  ms: number;
  forms_filled: number;
  forms_refilled: number;
  refusals_by_clause: Record<string, number>;
  entered: number;
}

/** The shape `engine/calllog.ts` actually writes. Written against CallRecord
 *  rather than against the design document, because the first version of this
 *  file was written the other way round and read two fields the log has never
 *  carried. */
export interface CallRecordish {
  ts?: string;
  tool?: string;
  ok?: boolean;
  outcome?: "result" | "rejected" | "errored";
  duration_ms?: number;
  /** Stamped by the lane at the moment the call is served. */
  where?: string[];
  args?: Record<string, unknown>;
  response?: unknown;
}

/** Calls the log cannot place. They are COUNTED rather than dropped: a total
 *  that silently omits work reads as a cheaper walk than happened. */
export const UNATTRIBUTED = "(before the first pull)";

function empty(): StateCost {
  return { calls: 0, ms: 0, forms_filled: 0, forms_refilled: 0, refusals_by_clause: {}, entered: 0 };
}

function bucket(out: Record<string, StateCost>, id: string): StateCost {
  const b = out[id] ?? empty();
  out[id] = b;
  return b;
}

/** THE CLAUSE A TYPED REFUSAL NAMES, or undefined for a crash.
 *
 *  IT LIVES ON THE RESPONSE, never on `outcome` — which is the three-value
 *  enum `result | rejected | errored`. The first version of this function read
 *  `outcome` and therefore counted nothing. `render.ts` and `failure-shapes.ts`
 *  both read `response.clause`, and this now agrees with them.
 *
 *  THE STRING FALLBACK IS FOR A CAPPED RESPONSE: the log truncates every
 *  non-se_run answer, so an object may arrive as a cut string. */
export function clauseOf(rec: CallRecordish): string | undefined {
  const r = rec.response;
  if (r !== null && typeof r === "object") {
    const c = (r as { clause?: unknown }).clause;
    if (typeof c === "string" && c !== "") return c;
  }
  return /SE-C-\d+/.exec(typeof r === "string" ? r : JSON.stringify(r ?? ""))?.[0];
}

/** The state a record was served in — the stamp, flattened. */
function whereOf(rec: CallRecordish): string | undefined {
  const w = rec.where;
  if (!Array.isArray(w) || w.length === 0) return undefined;
  return w.join(" · ");
}

/** WHAT A WALK COST, PER STATE, from the trail the lane already writes.
 *
 *  ATTRIBUTION IS READ, NOT INFERRED. Every record carries the state it was
 *  served in. The carry-forward rule this replaced tried to recover boundaries
 *  from each pull's response; measured on this project's own log, 2,233 of
 *  2,298 pull responses are capped to invalid JSON.
 *
 *  A RECORD WITH NO STAMP IS CARRIED FORWARD from the last one that had a
 *  stamp, so a log written before the stamp existed still partitions. What
 *  precedes the first stamp is counted under UNATTRIBUTED rather than dropped. */
export function costPerState(log: CallRecordish[]): Record<string, StateCost> {
  const out: Record<string, StateCost> = {};
  let here: string | undefined;
  let formRefused = false;
  for (const rec of log) {
    const stamp = whereOf(rec);
    if (stamp !== undefined && stamp !== here) {
      here = stamp;
      bucket(out, here).entered += 1;
    }
    const b = bucket(out, here ?? UNATTRIBUTED);
    b.calls += 1;
    b.ms += rec.duration_ms ?? 0;
    const refused = rec.ok === false;
    if (refused) {
      const clause = clauseOf(rec);
      if (clause !== undefined) b.refusals_by_clause[clause] = (b.refusals_by_clause[clause] ?? 0) + 1;
    }
    const isForm = rec.tool === "se_pull" && rec.args?.form !== undefined;
    if (isForm) {
      b.forms_filled += 1;
      // A REFILL IS A FORM SENT AGAIN AFTER A FORM WAS REFUSED — never after
      // any other call failed. The first version armed on every failure, so an
      // unrelated refusal before the session's first form counted as a refill.
      if (formRefused) b.forms_refilled += 1;
      formRefused = refused;
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
