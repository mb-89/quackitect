// Advanced Canvas reading — the machine authoring surface (owner ruling:
// machines are drawn, in Obsidian, with the Advanced Canvas plugin).
// JSON Canvas base format; Advanced Canvas adds metadata.frontmatter and
// styleAttributes on edges.
import { readFileSync } from "node:fs";
import { stripBom } from "./jsonio.ts";

export interface CanvasElement {
  id: string;
  type: "file" | "text" | "group" | "link";
  x: number;
  y: number;
  width: number;
  height: number;
  file?: string;
  text?: string;
  label?: string;
}

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
  styleAttributes?: Record<string, unknown>;
}

export interface CanvasData {
  nodes?: CanvasElement[];
  edges?: CanvasEdge[];
  metadata?: { frontmatter?: Record<string, unknown> };
  /** OPT-IN routed arrows (owner ruling 2026-08-04): centre-to-centre
   *  lines with band-detour waypoints. Generated machines set it; an
   *  authored canvas keeps its drawn side anchors. */
  routed?: boolean;
}

export function loadCanvas(path: string): CanvasData {
  return JSON.parse(stripBom(readFileSync(path, "utf8"))) as CanvasData;
}

// A NEW NODE IS BORN THE SIZE OF ITS LABEL (owner ruling 2026-07-28). The old
// rule made every new node roughly 620x640, which is a note-reading box, not a
// label box. A node now starts just big enough for its title and subtitle. The
// owner takes it from there in Obsidian, and what they draw is what renders.
const LABEL_CH = 15.6; // monospace advance at the .label size
const SUB_CH = 10.2; // ditto at .sublabel
const BOX_PAD = 26;

// A BOX IS SIZED BY THE TEXT IT SHOWS, NEVER BY THE TEXT IT HOLDS (owner
// ruling 2026-07-28). A generated expedition's subtitle is its whole goal
// statement — a thousand characters — while the drawing paints only the first
// line of it. Sizing from the full statement made e20's box 10793px wide to
// carry 48 visible characters, and no person can fix that in Obsidian because
// the node is generated. Both ends now read the SAME shortened label.
export const SUB_MAX = 48;

/** The subtitle as it is actually DRAWN — the single source both the size and
 *  the render measure. */
export function subLabel(subtitle?: string): string | undefined {
  if (subtitle === undefined || subtitle === "") return undefined;
  return subtitle.length > SUB_MAX ? `${subtitle.slice(0, SUB_MAX - 1)}…` : subtitle;
}

// The widest a box is ever BORN (owner confirmed 2026-07-29). A shortened
// subtitle cannot reach it; it is here for long generated ids, because a box
// wider than this is unreadable on any screen the drawing is meant to fit.
// IT IS NOT A CLAMP. A width the owner sets in Obsidian is theirs, and the
// render never re-imposes this one.
const BIRTH_MAX_W = 560;

/** The birth size of a drawn node: what its title and shown subtitle need,
 *  nothing more. This is a STARTING POINT a person then adjusts — never a size
 *  the render re-imposes later. */
export function nodeSize(title: string, subtitle?: string): { width: number; height: number } {
  const sub = subLabel(subtitle);
  const wide = Math.max(title.length * LABEL_CH, (sub ?? "").length * SUB_CH);
  const width = Math.min(BIRTH_MAX_W, Math.max(200, Math.ceil(wide) + BOX_PAD * 2));
  return { width, height: sub === undefined ? 72 : 100 };
}
