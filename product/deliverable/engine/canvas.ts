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
