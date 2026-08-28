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

import type { MirrorState, StateMeta } from "./render.ts";
import { type Intent, statePaint, view } from "./viewmodel.ts";

function bullets(title: string, lines: string[]): string[] {
  if (lines.length === 0) return [];
  return [`## ${title}`, ...lines.map((l) => `- ${l}`), ""];
}

// THE FIELD NAMES ARE THE DRAWING'S OWN. `leafActive` is where the walk
// stands, `openIds` is what is unfinished, and `paint` is the record-backed set
// the picture treats as done.
interface DrawingSets {
  active: Set<string>;
  paint: Set<string>;
  open: Set<string>;
  meta: Record<string, StateMeta>;
}

/** THE CLASS THE PICTURE STROKES, AS A WORD.
 *
 *  ONE DECIDER PER PAINT, and this surface asks it rather than deciding for
 *  itself. It used to read a `done` set directly, so every rule the decider
 *  learned — suspect, and now the refusal over owed work — was invisible here.
 *  see dsp-mirror-render.md#one-decider-says-which-kind-of-green-it-is */
const WORD: Record<string, string> = {
  "state active": "HERE",
  "state suspect": "suspect",
  "state owed": "owed",
  "state done": "green",
  "state done proven": "green",
  state: "",
};

function stateLine(id: string, detail: Record<string, unknown>, drawing: DrawingSets): string {
  const marks: string[] = [];
  const { cls } = statePaint(id, drawing.active, drawing.paint, drawing.meta);
  // AN UNKNOWN CLASS PRINTS ITSELF rather than nothing. A word missing from the
  // table is a decider that grew a case this surface has not been told about,
  // and a blank would hide exactly that.
  const word = WORD[cls] ?? cls;
  if (word !== "") marks.push(word);
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
  const meta = d.meta;
  return {
    active: grab("leafActive"),
    // THE PICTURE'S OWN doneIds IS `paint`, the record-backed set, never the
    // live run's `done`. Reading the other one made this surface answer a
    // different question from the drawing beside it.
    paint: grab("paint"),
    open: grab("openIds"),
    meta: meta !== null && typeof meta === "object" ? (meta as Record<string, StateMeta>) : {},
  };
}

/** ONE HOP, AS A LINE A PERSON READS.
 *  see dsp-mirror-render.md#the-surface-prints-a-hop-rather-than-its-shape */
function hopLine(h: unknown): string {
  if (h === null || typeof h !== "object") return String(h);
  const e = h as { state?: unknown; outcome?: unknown; evidence?: unknown; at?: unknown };
  const at = typeof e.at === "string" ? e.at.slice(11, 16) : "";
  const why = typeof e.evidence === "string" && e.evidence !== "" ? ` — ${e.evidence}` : "";
  return `${String(e.state ?? "(no state)")} — ${String(e.outcome ?? "?")}${at === "" ? "" : ` at ${at}`}${why}`;
}

/** The surface as lines. `view` names which machine to print; absent, the one
 *  the walk is in. */
export function mirrorText(m: MirrorState, intent: Intent = {}): string {
  const v = view(m, intent);
  const packet = v.packet as Record<string, unknown>;
  const drawing = setsOf(v.drawing);
  const out: string[] = [];

  out.push(`# ${v.viewed.id}${v.viewingWalk ? "" : `  (the walk is in ${v.walkMachineId})`}`, "");

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

  out.push(...bullets("Last hops", (Array.isArray(v.history) ? v.history : []).slice(-10).map(hopLine)));

  if (v.comment.trim() !== "") out.push("## The drawing's own note", "", v.comment.trim(), "");

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}
