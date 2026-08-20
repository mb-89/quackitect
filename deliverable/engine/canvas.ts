// see dsp-method-compilation.md#advanced-canvas-reading
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

// see dsp-method-compilation.md#a-new-node-is-born-the-size-of-its
const LABEL_CH = 15.6; // monospace advance at the .label size
const SUB_CH = 10.2; // ditto at .sublabel
const BOX_PAD = 26;

// see dsp-method-compilation.md#a-box-is-sized-by-the-text-it-shows
export const SUB_MAX = 48;

/** The subtitle as it is actually DRAWN — the single source both the size and
 *  the render measure. */
export function subLabel(subtitle?: string): string | undefined {
  if (subtitle === undefined || subtitle === "") return undefined;
  return subtitle.length > SUB_MAX ? `${subtitle.slice(0, SUB_MAX - 1)}…` : subtitle;
}

// see dsp-method-compilation.md#the-widest-a-box-is-ever-born
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
