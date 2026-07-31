// The rigor matrix — reader and column compiler (owner design 2026-07-29).
//
// The folder (machines/rigor_matrix) is the single source: rows are the
// full-battery steps, cells tailor each step per change size. This module
// reads it LIVE (seed-from-source: no baked copy exists to drift) and
// compiles a change-size column into an iteration machine the kernel can
// run. Struck states (applies: none) vanish; their dependencies CONTRACT
// through them, so the seeded machine stays connected.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote, section } from "./notes.ts";
import { validateMachine, type EdgeDecl, type EvidenceField, type MachineDecl, type StateDecl } from "./machine.ts";

// specification is not a rigor level: it says how a step's output becomes
// documentation. It is read and validated like any column, never pinned.
export const CHANGE_COLUMNS = ["patch", "minor", "major", "product"] as const;
export const ALL_COLUMNS = [...CHANGE_COLUMNS, "specification"] as const;
export type ChangeColumn = (typeof CHANGE_COLUMNS)[number];
export type RigorRigorMatrixColumn = (typeof ALL_COLUMNS)[number];

const APPLIES = new Set(["full", "tailored", "inherit", "none"]);

export interface RigorRigorMatrixRow {
  /** The stable short name — the join key cells and dependencies use. */
  name: string;
  /** The ordering projection: M<gate>_<step><letter>_<title>. */
  file: string;
  /** The milestone group, from the file name (M0..M9). */
  milestone: string;
  statement: string;
  state_kind: "work" | "gate" | "terminal";
  filled_by: "agent" | "engine";
  command?: string;
  depends_on: string[];
  /** Set when the state SEEDS (authors) an iteration-local sub-machine. */
  seeds?: string;
  /** Set when the state RUNS a seeded sub-machine — the walk descends here. */
  runs?: string;
  floor: boolean;
  edge_role?: string;
  guard?: string;
  guidance: string;
  evidence_form: EvidenceField[];
  /** Narrows what the compiled state may call. Absent means every lane tool. */
  legal_tools?: string[];
}

export interface RigorRigorMatrixCell {
  row: string;
  column: RigorMatrixColumn;
  applies: "full" | "tailored" | "inherit" | "none";
  body: string;
}

export interface RigorMatrix {
  rows: RigorMatrixRow[];
  /** row name -> column -> cell */
  cells: Map<string, Map<string, RigorMatrixCell>>;
}

function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim() !== "") return v.split(",").map((s) => s.trim());
  return [];
}

// Evidence lives in FRONTMATTER (owner ruling 2026-07-30): a nested YAML
// list the form machinery consumes directly. A body "## Evidence form"
// section is refused — one truth, no echo.
function parseEvidence(fm: Record<string, unknown>, file: string, body: string): EvidenceField[] {
  if (section(body, "Evidence form")) {
    throw new Error(`matrix row ${file} carries a body evidence section — the frontmatter evidence block is the single truth`);
  }
  const raw = fm.evidence;
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) throw new Error(`matrix row ${file} evidence block is not a list`);
  return raw.map((entry, i) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`matrix row ${file} evidence entry ${i + 1} is not a mapping`);
    }
    const f = entry as Record<string, unknown>;
    if (typeof f.name !== "string" || f.name.trim() === "") {
      throw new Error(`matrix row ${file} evidence entry ${i + 1} declares no name`);
    }
    return {
      name: f.name,
      description: typeof f.description === "string" ? f.description : "",
      required: f.required !== false,
      ...(f.killer === true ? { killer: true } : {}),
    };
  });
}

export function matrixDir(root: string): string {
  return join(root, "product", "deliverable", "machines", "rigor_matrix");
}

/** The matrix CONTENT hash — a pin records it, so drift between a pinned
 *  machine and the live matrix stays detectable (and silent until asked —
 *  owner verdict 2026-07-30). Data only; the Bases view is presentation. */
export function rigorMatrixContentHash(root: string): string {
  const dir = matrixDir(root);
  const h = createHash("sha256");
  for (const sub of ["rows", "cells"]) {
    for (const file of readdirSync(join(dir, sub)).filter((f) => f.endsWith(".md")).sort()) {
      h.update(`${sub}/${file}\n`);
      h.update(readFileSync(join(dir, sub, file)));
    }
  }
  return h.digest("hex").slice(0, 12);
}

export function readRigorMatrix(root: string): Matrix {
  const dir = matrixDir(root);
  const rows: RigorMatrixRow[] = [];
  const byName = new Map<string, RigorMatrixRow>();
  for (const file of readdirSync(join(dir, "rows")).filter((f) => f.endsWith(".md")).sort()) {
    const note = parseStateNote(readFileSync(join(dir, "rows", file), "utf8"));
    const fm = note.frontmatter;
    const name = typeof fm.name === "string" ? fm.name : "";
    if (!name) throw new Error(`matrix row ${file} declares no name`);
    if (byName.has(name)) throw new Error(`matrix row name ${name} is declared twice (${byName.get(name)?.file} and ${file})`);
    const row: RigorMatrixRow = {
      name,
      file,
      milestone: file.split("_")[0] ?? "",
      statement: typeof fm.statement === "string" ? fm.statement : "",
      state_kind: fm.state_kind === "gate" ? "gate" : fm.state_kind === "terminal" ? "terminal" : "work",
      filled_by: fm.filled_by === "engine" ? "engine" : "agent",
      command: typeof fm.command === "string" ? fm.command : undefined,
      depends_on: asList(fm.depends_on),
      seeds: typeof fm.seeds === "string" ? fm.seeds : undefined,
      runs: typeof fm.runs === "string" ? fm.runs : undefined,
      floor: fm.floor === true,
      edge_role: typeof fm.edge_role === "string" ? fm.edge_role : undefined,
      guard: typeof fm.guard === "string" ? fm.guard : undefined,
      guidance: section(note.body, "Guidance"),
      evidence_form: parseEvidence(fm, file, note.body),
      legal_tools: fm.legal_tools === undefined ? undefined : asList(fm.legal_tools),
    };
    if (row.state_kind !== "terminal" && row.evidence_form.length === 0) {
      throw new Error(`matrix row ${row.name} carries no evidence — leaving a state demands evidence; only a terminal is exempt`);
    }
    rows.push(row);
    byName.set(name, row);
  }
  for (const row of rows) {
    for (const d of row.depends_on) {
      if (!byName.has(d)) throw new Error(`matrix row ${row.name} depends on undeclared row ${d}`);
    }
  }
  const cells = new Map<string, Map<string, RigorMatrixCell>>();
  for (const file of readdirSync(join(dir, "cells")).filter((f) => f.endsWith(".md")).sort()) {
    const note = parseStateNote(readFileSync(join(dir, "cells", file), "utf8"));
    const fm = note.frontmatter;
    const rowName = typeof fm.row === "string" ? fm.row : "";
    const column = typeof fm.column === "string" ? fm.column : "";
    if (!byName.has(rowName)) throw new Error(`matrix cell ${file} names undeclared row ${rowName}`);
    if (!(ALL_COLUMNS as readonly string[]).includes(column)) throw new Error(`matrix cell ${file} names unknown column ${column}`);
    const applies = typeof fm.applies === "string" ? fm.applies : "";
    if (!APPLIES.has(applies)) throw new Error(`matrix cell ${file} carries unknown applies value "${applies}"`);
    let per = cells.get(rowName);
    if (!per) cells.set(rowName, (per = new Map()));
    if (per.has(column)) throw new Error(`matrix cell for ${rowName} at ${column} is declared twice`);
    per.set(column, { row: rowName, column: column as RigorMatrixColumn, applies: applies as RigorMatrixCell["applies"], body: note.body.trim() });
  }
  // The explicit-N/A law: absence is "not yet written" and refuses loudly.
  for (const row of rows) {
    for (const col of ALL_COLUMNS) {
      if (!cells.get(row.name)?.has(col)) throw new Error(`matrix row ${row.name} is missing its ${col} cell — an N/A is an explicit file, never an absence`);
    }
  }
  return { rows, cells };
}

/** Priority anchors per state kind (the autonomy scale's bands). */
function priorityOf(row: RigorMatrixRow): number {
  if (row.state_kind === "terminal") return 0.01;
  if (row.filled_by === "engine") return 0.01;
  if (row.state_kind === "gate") return 0.6;
  return 0.2;
}

/** Compile one change-size column into an iteration machine. Struck rows
 *  vanish; each surviving row's dependencies contract transitively through
 *  the struck ones, so the walk stays connected without them. */
export function compileColumn(matrix: Matrix, column: ChangeColumn): MachineDecl {
  const byName = new Map(matrix.rows.map((r) => [r.name, r]));
  const applied = new Set(
    matrix.rows.filter((r) => matrix.cells.get(r.name)?.get(column)?.applies !== "none").map((r) => r.name),
  );
  const memo = new Map<string, string[]>();
  const resolve = (name: string, visiting: Set<string>): string[] => {
    if (applied.has(name)) return [name];
    if (memo.has(name)) return memo.get(name)!;
    if (visiting.has(name)) return [];
    visiting.add(name);
    const row = byName.get(name)!;
    const out = [...new Set(row.depends_on.flatMap((d) => resolve(d, visiting)))];
    visiting.delete(name);
    memo.set(name, out);
    return out;
  };

  const states: StateDecl[] = [];
  const edgesFrom = new Map<string, EdgeDecl[]>();
  const roots: string[] = [];
  for (const row of matrix.rows) {
    if (!applied.has(row.name)) continue;
    const deps = [...new Set(row.depends_on.flatMap((d) => resolve(d, new Set([row.name]))))].filter((d) => d !== row.name);
    if (deps.length === 0) roots.push(row.name);
    for (const d of deps) {
      let list = edgesFrom.get(d);
      if (!list) edgesFrom.set(d, (list = []));
      if (row.edge_role === "fallback") {
        list.push({ to: row.name, role: "fallback", ...(row.guard ? { guard: row.guard } : {}) });
        // The recovery edge closes the loop back to the dependency.
        let back = edgesFrom.get(row.name);
        if (!back) edgesFrom.set(row.name, (back = []));
        back.push({ to: d, role: "recovery" });
      } else {
        list.push({ to: row.name, role: byName.get(d)!.state_kind === "gate" ? "approval" : "normal" });
      }
    }
  }

  const start: StateDecl = {
    id: "start",
    kind: "start",
    statement: "",
    guidance: `The seeded ${column} walk begins. The matrix is the source; this machine is its compilation.`,
    evidence_form: [],
    priority: 0.01,
    edges: roots.map((r) => ({ to: r, role: "normal" as const })),
  };
  states.push(start);
  for (const row of matrix.rows) {
    if (!applied.has(row.name)) continue;
    const cell = matrix.cells.get(row.name)!.get(column)!;
    states.push({
      id: row.name,
      kind: row.state_kind,
      group: row.milestone,
      statement: row.statement,
      filled_by: row.filled_by,
      ...(row.command ? { command: row.command } : {}),
      guidance: [cell.body, row.guidance].filter(Boolean).join("\n\n"),
      evidence_form: row.evidence_form,
      ...(row.runs ? { submachine: row.runs } : {}),
      priority: priorityOf(row),
      // Absent stays minimal — the always-legal three and nothing else. The
      // kickoff sets each state's rights, so a row opens only what it declares.
      // A state must declare enough to execute the remedy its own refusal hands
      // back, or SE-C-112 answers with SE-C-110 and the walk cannot recover.
      ...(row.legal_tools !== undefined ? { legal_tools: row.legal_tools } : {}),
      edges: edgesFrom.get(row.name) ?? [],
    });
  }
  const decl: MachineDecl = { id: `iteration-${column}`, reentry: "resume", initial: "start", states };
  validateMachine(decl);
  return decl;
}
