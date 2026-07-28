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

/** The birth size of a drawn node: what its title and subtitle need, nothing
 *  more. This is a STARTING POINT a person then adjusts — never a size the
 *  render re-imposes later. */
export function nodeSize(title: string, subtitle?: string): { width: number; height: number } {
  const sub = subtitle !== undefined && subtitle !== "" ? subtitle : undefined;
  const wide = Math.max(title.length * LABEL_CH, (sub ?? "").length * SUB_CH);
  return { width: Math.max(200, Math.ceil(wide) + BOX_PAD * 2), height: sub === undefined ? 72 : 100 };
}
