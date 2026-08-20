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
export const UNATTRIBUTED = "(unstamped)";

/** Thrown rather than returned, because a caller that ignores this would write
 *  the emptiness into a report as though it were a measurement. */
export class Unpartitionable extends Error {}

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
  // A LOG WITH NO STAMP AT ALL CANNOT ANSWER THIS QUESTION, and answering it
  // anyway is worse than answering nothing. Before this guard, a pre-stamp log
  // produced ONE bucket holding every call — 801 calls, three TYPED refusals
  // that only a state gate can emit, and `entered: 0` — under a label that read
  // like a cause. Rendered into a report's per-state table, a reader believes
  // it. An empty answer is unmistakably broken; a plausible one is not.
  if (log.length > 0 && !log.some((r) => Array.isArray(r.where) && r.where.length > 0)) {
    throw new Unpartitionable(
      `${String(log.length)} records and not one carries a walk position — this log predates the stamp, so cost per state cannot be derived from it. Records written from now on carry it; this one is not a baseline.`,
    );
  }
  const out: Record<string, StateCost> = {};
  let here: string | undefined;
  // PER STATE, NOT PER LOOP. Held on the loop, a form refused in one state
  // billed a refill to the NEXT state's first form. Reset on every state change
  // instead and a genuine refill was lost when the state moved between the
  // refusal and the retry. Both are wrong; the flag belongs to the bucket.
  const formRefused = new Map<string, boolean>();
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
      const key = here ?? UNATTRIBUTED;
      b.forms_filled += 1;
      // A REFILL IS A FORM SENT AGAIN AFTER A FORM WAS REFUSED — never after
      // any other call failed. The first version armed on every failure, so an
      // unrelated refusal before the session's first form counted as a refill.
      if (formRefused.get(key) === true) b.forms_refilled += 1;
      formRefused.set(key, refused);
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
  // THE STAMP SET IS CHECKED, NOT MERELY CARRIED. `stamp_covers` used to be
  // emitted and never looked at, so a report could name all six directories
  // with an empty hash beside each — a line that LOOKS like the set is stamped
  // and asserts nothing. That is "claims more than it knows" in a new costume.
  const covers = String(report.stamp_covers ?? "");
  if (covers.trim() === "") out.push("stamp_covers: a report says which directories its conditions cover, or it claims the matrix alone");
  else {
    const blank = covers
      .split(" ")
      .filter((p) => p.includes("="))
      .filter((p) => p.split("=")[1] === "")
      .map((p) => p.split("=")[0]);
    if (blank.length > 0)
      out.push(`stamp_covers: ${blank.join(", ")} named with no hash — a directory in the set is stamped or it is not in the set`);
  }
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
 *  The rigor matrix hash covers `rigor_matrix/rows` and nothing else, so
 *  guidance, forms, items, methods and the engine all change what a walk costs
 *  without moving it.
 *  see dsp-benchmark-report.md#the-stamp-is-a-set-not-one-hash
 *
 *  A REPORT STAMPING THE MATRIX ALONE CLAIMS MORE THAN IT KNOWS: it would call
 *  two runs comparable across exactly the changes this project makes most
 *  often. */
export function conditionsStampDirs(): string[] {
  return [
    "deliverable/engine",
    "deliverable/machines/forms",
    "deliverable/machines/items",
    "deliverable/machines/methods",
    "deliverable/machines/rigor_matrix/rows",
    "guidance",
  ];
}
