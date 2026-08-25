// THE SURFACE, IN WORDS. The same view model the page draws, printed so the
// agent can read it without a picture.
//
// WHY THIS EXISTS. An agent could only see the person's surface by taking a
// screenshot, and a screenshot is something it must ask permission for every
// time (contract rule 10). That made the everyday question — what does the
// person see right now — cost a request each time it was asked.
//
// ONE SOURCE, TWO PROJECTIONS, and this is the third. `view()` answers every
// fact; the page turns it into markup and this turns it into lines. Nothing
// here reads the walk directly, so the two projections cannot drift.
//
// A PICTURE IS STILL A PICTURE. Where the question is genuinely about layout,
// a screenshot is the right answer and the agent asks for one.

import type { MirrorState } from "./render.ts";
import { type Intent, view } from "./viewmodel.ts";

function bullets(title: string, lines: string[]): string[] {
  if (lines.length === 0) return [];
  return [`## ${title}`, ...lines.map((l) => `- ${l}`), ""];
}

// THE FIELD NAMES ARE THE DRAWING'S OWN. `leafActive` is where the walk
// stands, `openIds` is what is unfinished, and `paint` already carries the
// decided colour per state — the same one decider the picture uses, so a mark
// here can never disagree with a mark there.
interface DrawingSets {
  active: Set<string>;
  done: Set<string>;
  open: Set<string>;
  paint: Record<string, string>;
}

function stateLine(id: string, detail: Record<string, unknown>, drawing: DrawingSets): string {
  const marks: string[] = [];
  if (drawing.active.has(id)) marks.push("HERE");
  const paint = drawing.paint[id];
  if (typeof paint === "string" && paint !== "") marks.push(paint);
  else if (drawing.done.has(id)) marks.push("green");
  if (drawing.open.has(id)) marks.push("open");
  const kind = typeof detail.kind === "string" ? detail.kind : "";
  if (kind !== "") marks.push(kind);
  return marks.length === 0 ? id : `${id} — ${marks.join(", ")}`;
}

function setsOf(drawing: unknown): DrawingSets {
  const d = (drawing ?? {}) as Record<string, unknown>;
  const grab = (k: string): Set<string> => {
    const v = d[k];
    if (v instanceof Set) return v as Set<string>;
    if (Array.isArray(v)) return new Set(v.map(String));
    return new Set<string>();
  };
  const rawPaint = d.paint;
  const paint: Record<string, string> = {};
  if (rawPaint instanceof Map) for (const [k, val] of rawPaint) paint[String(k)] = String(val);
  else if (rawPaint !== null && typeof rawPaint === "object")
    for (const [k, val] of Object.entries(rawPaint as Record<string, unknown>)) paint[k] = String(val);
  return { active: grab("leafActive"), done: grab("done"), open: grab("openIds"), paint };
}

/** The surface as lines. `view` names which machine to print; absent, the one
 *  the walk is in. */
export function mirrorText(m: MirrorState, intent: Intent = {}): string {
  const v = view(m, intent);
  const packet = v.packet as Record<string, unknown>;
  const drawing = setsOf(v.drawing);
  const out: string[] = [];

  out.push(`# ${v.viewed.id}${v.viewingWalk ? "" : "  (the walk is in " + v.walkMachineId + ")"}`, "");

  const where = Array.isArray(v.describe.active) ? v.describe.active.join(", ") : "";
  out.push(
    ...bullets("Where the walk stands", [
      `state: ${where === "" ? "nowhere" : where}`,
      `status: ${v.describe.status}`,
      `target: ${v.target === "" || v.target === undefined ? "none" : String(v.target)}`,
    ]),
  );

  out.push(
    ...bullets("The person's dials", [
      `autonomy: ${String(v.panel.autonomy)}`,
      `narration every: ${String(v.panel.ints.narration_minutes)} minutes or ${String(v.panel.ints.narration_calls)} calls`,
    ]),
  );

  const legal = Array.isArray(packet.legal_tools) ? [...new Set((packet.legal_tools as unknown[]).map(String))] : [];
  out.push(...bullets("Legal here", legal.length === 0 ? ["nothing declared"] : legal));

  const rows = Object.entries(v.states as Record<string, Record<string, unknown>>);
  out.push(
    ...bullets(
      `States (${String(rows.length)})`,
      rows.map(([id, d]) => stateLine(id, d, drawing)),
    ),
  );

  const history = Array.isArray(v.history) ? v.history.map(String) : [];
  out.push(...bullets("Last hops", history.slice(-10)));

  if (v.comment.trim() !== "") out.push("## The drawing's own note", "", v.comment.trim(), "");

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}
