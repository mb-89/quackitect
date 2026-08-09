// THE LEGAL EDGES, read from machines/trace-schema.md (owner ruling
// 2026-08-07). One file says what may point at what. An edge it does not
// list is a defect, and this is what says so.
//
// WHY A FILE AND NOT A CONSTANT. The spine is method, not engine. A product
// that vendors this and adds a level edits its own schema; nothing here
// knows how many types there are or what they are called.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote } from "./notes.ts";
import { type Subsegments, TRACE_SUBSEGMENTS, type TraceNode } from "./trace.ts";

export interface TraceEdge {
  /** The child's type — the end that carries the edge. */
  from: string;
  /** The frontmatter key it lives under on the child. */
  key: string;
  /** The parent's type — what it may point at. */
  to: string;
}

export const TRACE_SCHEMA_REL = "project/deliverable/machines/trace-schema.md";

/** Every declared edge. An unreadable or absent schema yields none, which
 *  checks nothing rather than refusing everything — a product mid-vendoring
 *  must not be unable to submit because its schema has not landed yet. */
export function traceSchema(root: string): TraceEdge[] {
  const abs = join(root, TRACE_SCHEMA_REL);
  if (!existsSync(abs)) return [];
  try {
    const raw = parseStateNote(readFileSync(abs, "utf8")).frontmatter.edges;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((e) => e as Record<string, unknown>)
      .filter((e) => typeof e.from === "string" && typeof e.to === "string" && typeof e.key === "string")
      .map((e) => ({ from: String(e.from), key: String(e.key), to: String(e.to) }));
  } catch {
    return [];
  }
}

/** THE SUBSEGMENTS, read from the same file as the edges. An absent or
 *  unreadable declaration yields the built-in one, so a product mid-vendoring
 *  still draws. */
export function traceSubsegments(root: string): Subsegments {
  const abs = join(root, TRACE_SCHEMA_REL);
  if (!existsSync(abs)) return TRACE_SUBSEGMENTS;
  try {
    const raw = parseStateNote(readFileSync(abs, "utf8")).frontmatter.subsegments;
    if (!Array.isArray(raw) || raw.length === 0) return TRACE_SUBSEGMENTS;
    const of = raw
      .map((s) => s as Record<string, unknown>)
      .filter((s) => typeof s.id === "string")
      .map((s) => ({
        id: String(s.id),
        label: typeof s.label === "string" ? String(s.label) : String(s.id),
        levels: Array.isArray(s.levels) ? s.levels.map(String) : [],
      }));
    return of.length === 0 ? TRACE_SUBSEGMENTS : { of };
  } catch {
    return TRACE_SUBSEGMENTS;
  }
}

/** WHICH SLICE A TYPE LIVES IN, or undefined while it is still on the spine.
 *  The spine is what every slice can see; past it they are strangers. */
export function sliceFor(sub: Subsegments, type: string): string | undefined {
  return sub.of.find((s) => s.levels.includes(type))?.id;
}

/** Which frontmatter keys a type may carry its upward edge under. */
export function edgeKeys(schema: TraceEdge[], type: string): string[] {
  return [...new Set(schema.filter((e) => e.from === type).map((e) => e.key))];
}

/** Every upward-edge key any type uses. A node carrying one that is not its
 *  own is pointing the wrong way under the wrong name. */
const allKeys = (schema: TraceEdge[]): string[] => [...new Set(schema.map((e) => e.key))];

function frontmatterOf(file: string | undefined): Record<string, unknown> {
  if (file === undefined || !existsSync(file)) return {};
  try {
    return parseStateNote(readFileSync(file, "utf8")).frontmatter;
  } catch {
    return {};
  }
}

/** ONE NODE'S EDGES, against the schema. Two ways an edge is wrong, and both
 *  refuse rather than warn:
 *
 *  - IT LANDS ON THE WRONG TYPE. A function pointing at a use case is the
 *    case this was built for. The chain runs use case, requirement, function,
 *    and a diagonal edge makes a requirement look covered because something
 *    two levels down mentioned its use case.
 *  - IT USES THE WRONG KEY. A function writing `refines:` says it breaks a
 *    requirement into finer grain. It does not. It says what the system does
 *    so the requirement holds, and that word is `satisfies`.
 *
 *  A TYPE THE SCHEMA DOES NOT MENTION IS NOT CHECKED. Stakeholders, RAID
 *  entries and neighbours stand beside the trace rather than in it. Refusing
 *  them would make the schema a list of everything instead of a list of the
 *  spine. */
export function edgeProblems(
  n: TraceNode,
  byId: Map<string, TraceNode>,
  root: string,
  schema = traceSchema(root),
  sub = traceSubsegments(root),
): string[] {
  const legal = schema.filter((e) => e.from === n.type);
  if (legal.length === 0) return [];
  const out: string[] = [];
  // NO EDGE CROSSES BETWEEN SLICES (owner design 2026-08-07). A slice is its
  // own chain from the requirement outward: design one way, testing the
  // other. A function pointing at a test definition would tie them back
  // together, and the drawing could not keep them apart.
  //
  // THE SPINE IS EXEMPT because it is what both slices see. A function
  // pointing at a requirement is the division itself, not a crossing.
  const mySlice = sliceFor(sub, n.type);
  if (mySlice !== undefined) {
    const crossed = n.refines.filter((p) => {
      const theirs = sliceFor(sub, byId.get(p)?.type ?? "");
      return theirs !== undefined && theirs !== mySlice;
    });
    if (crossed.length > 0) {
      out.push(`${n.id}: a ${n.type} is in the ${mySlice} slice and points across into another — ${crossed.join(" · ")}`);
    }
  }
  const targets = legal.map((e) => e.to);
  const wrong = n.refines.filter((p) => byId.has(p) && !targets.includes(byId.get(p)?.type ?? ""));
  if (wrong.length > 0) {
    const said = wrong.map((p) => `${p} is a ${byId.get(p)?.type}`).join(" · ");
    out.push(`${n.id}: a ${n.type} points at ${targets.join(" or ")} — ${said}`);
  }
  const mine = edgeKeys(schema, n.type);
  const fm = frontmatterOf(n.file);
  const foreign = allKeys(schema).filter((k) => !mine.includes(k) && fm[k] !== undefined);
  if (foreign.length > 0) {
    out.push(`${n.id}: a ${n.type} carries its edge under ${mine.join(" or ")}, not ${foreign.join(" or ")}`);
  }
  return out;
}
