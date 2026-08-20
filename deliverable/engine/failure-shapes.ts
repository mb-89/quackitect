// see dsp-call-log.md — a repeating failure becomes work.
//
// req-repeated-failure-shape-becomes-durable-work. A failure absorbed call by
// call teaches nobody. The same shape hit five times in one session is a
// defect wearing a refusal's clothes, and it should leave the session as
// something a later one can pick up.
//
// THE THRESHOLD IS AN ASSUMPTION, NOT A MEASUREMENT. The requirement carries
// no `measure`, so "recurs" has no counted meaning yet. Twice is the cheapest
// honest reading and it is stated here rather than buried.

export const RECURRENCE_THRESHOLD = 2;

/** Refusals that mean the agent called a tool wrongly and was told so. The
 *  system working is not a defect, however often it happens. */
export const MISUSE_CLAUSES = new Set([
  "SE-C-101", // unknown argument
  "SE-C-046", // wrong field names on a patch op
  "SE-C-110", // a form nothing asked for, or an undrawn target
  "SE-C-112", // a claim that does not pass its own checks
]);

export interface CallRecord {
  tool?: string;
  outcome?: string;
  response?: unknown;
}

export interface Shape {
  clause: string;
  tool: string;
  count: number;
}

/** The failure shape of one record, or undefined when it is not a failure.
 *
 *  THE CLAUSE IS THE SHAPE. Two refusals of the same clause from the same
 *  verb are the same problem happening twice; the message text varies with
 *  the arguments and would split one shape into many. */
export function shapeOf(rec: CallRecord): { clause: string; tool: string } | undefined {
  if (rec.outcome !== "rejected" && rec.outcome !== "errored") return undefined;
  const body = typeof rec.response === "string" ? rec.response : JSON.stringify(rec.response ?? {});
  const m = /"clause"\s*:\s*"([^"]+)"/.exec(body);
  if (m === null) return undefined;
  return { clause: m[1] ?? "", tool: String(rec.tool ?? "") };
}

/** Shapes that recurred and are not misuse, worst first.
 *
 *  DIFFERENT SHAPES ARE NEVER COLLAPSED. A counter keyed on "a refusal
 *  happened" would report one problem where there are three, which is the
 *  failure mode a naive count has. */
export function recurringShapes(records: CallRecord[], threshold = RECURRENCE_THRESHOLD): Shape[] {
  const counts = new Map<string, Shape>();
  for (const rec of records) {
    const s = shapeOf(rec);
    if (s === undefined || MISUSE_CLAUSES.has(s.clause)) continue;
    const key = `${s.clause}|${s.tool}`;
    const held = counts.get(key);
    if (held === undefined) counts.set(key, { clause: s.clause, tool: s.tool, count: 1 });
    else held.count += 1;
  }
  return [...counts.values()].filter((s) => s.count >= threshold).sort((a, b) => b.count - a.count);
}

/** What a recurring shape says when it is written down as durable work. The
 *  owner and the trigger are what make it actionable by somebody else. */
export function asWorkStatement(s: Shape): { statement: string; where: string } {
  return {
    statement: `${s.clause} refused ${s.tool} ${String(s.count)} times in one window — the shape repeats, so the cause is in the system rather than in one call`,
    where: `ready when someone can reproduce ${s.clause} from ${s.tool} deliberately`,
  };
}
