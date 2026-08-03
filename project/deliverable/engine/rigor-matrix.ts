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
import { CLAUSES, Rejection } from "./errors.ts";
import {
  type EdgeDecl,
  type EvidenceField,
  type EvidenceType,
  type MachineDecl,
  STANDARD_ROUNDS,
  type StateDecl,
  validateMachine,
} from "./machine.ts";
import { parseStateNote, section } from "./notes.ts";

const SRC = "engine/rigor-matrix.ts";

export const EVIDENCE_TYPES: EvidenceType[] = ["claim", "table", "prose", "list", "verdict", "files", "derived", "matrix", "run_ref"];

// specification is not a rigor level: it says how a step's output becomes
// documentation. It is read and validated like any column, never pinned.
// THE LARGEST CHANGE SIZE IS "product", and it is a VOCABULARY word, not the
// folder. The folder rename swept it by accident and took 54 tests with it:
// the columns stopped matching the frontmatter keys the rows actually carry.
export const CHANGE_COLUMNS = ["patch", "minor", "major", "product"] as const;
export const ALL_COLUMNS = [...CHANGE_COLUMNS, "specification"] as const;
export type ChangeColumn = (typeof CHANGE_COLUMNS)[number];
export type RigorMatrixColumn = (typeof ALL_COLUMNS)[number];

const APPLIES = new Set(["full", "tailored", "inherit", "none"]);

export interface RigorMatrixRow {
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

export interface RigorMatrixCell {
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
    // An UNKNOWN type refuses rather than falling back to prose. A row that
    // says `type: tabel` would otherwise be checked as free text forever,
    // which is the quiet-divergence failure this repository refuses everywhere.
    if (f.type !== undefined && !EVIDENCE_TYPES.includes(String(f.type) as EvidenceType)) {
      throw new Error(
        `matrix row ${file} field ${f.name}: unknown evidence type "${String(f.type)}" — one of ${EVIDENCE_TYPES.join(", ")}`,
      );
    }
    return {
      name: f.name,
      description: typeof f.description === "string" ? f.description : "",
      required: f.required !== false,
      ...(f.type !== undefined ? { type: String(f.type) as EvidenceType } : {}),
      ...(typeof f.guidance === "string" && f.guidance.trim() !== "" ? { guidance: f.guidance } : {}),
    };
  });
}

export function matrixDir(root: string): string {
  return join(root, "project", "deliverable", "machines", "rigor_matrix");
}

/** The matrix CONTENT hash — a pin records it, so drift between a pinned
 *  machine and the live matrix stays detectable (and silent until asked —
 *  owner verdict 2026-07-30). Data only; the Bases view is presentation. */
export function rigorMatrixContentHash(root: string): string {
  const dir = matrixDir(root);
  const h = createHash("sha256");
  for (const file of readdirSync(join(dir, "rows"))
    .filter((f) => f.endsWith(".md"))
    .sort()) {
    h.update(`rows/${file}\n`);
    h.update(readFileSync(join(dir, "rows", file)));
  }
  return h.digest("hex").slice(0, 12);
}

const MATRIX_CACHE = new Map<string, { stamp: string; matrix: RigorMatrix }>();

/** CACHED AGAINST CONTENT, never against size and modification time
 *  (software.md). Hashing the 150 source files costs about a quarter of
 *  parsing them, and a single render asks for the matrix several times over
 *  - it was the largest read cost in the profile.
 *
 *  THE RETURNED MATRIX IS SHARED. Nothing may mutate it. */
export function readRigorMatrix(root: string): RigorMatrix {
  const stamp = rigorMatrixContentHash(root);
  const hit = MATRIX_CACHE.get(root);
  if (hit !== undefined && hit.stamp === stamp) return hit.matrix;
  const matrix = readRigorMatrixFresh(root);
  MATRIX_CACHE.set(root, { stamp, matrix });
  return matrix;
}

function readRigorMatrixFresh(root: string): RigorMatrix {
  const dir = matrixDir(root);
  const rows: RigorMatrixRow[] = [];
  const byName = new Map<string, RigorMatrixRow>();
  const fmByName = new Map<string, Record<string, unknown>>();
  for (const file of readdirSync(join(dir, "rows"))
    .filter((f) => f.endsWith(".md"))
    .sort()) {
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
    fmByName.set(name, fm);
  }
  for (const row of rows) {
    for (const d of row.depends_on) {
      if (!byName.has(d)) throw new Error(`matrix row ${row.name} depends on undeclared row ${d}`);
    }
  }
  // A CELL IS FRONTMATTER ON ITS ROW. It used to be a file of its own, and
  // three of that file's four keys echoed its own name — kind, row and
  // column all restated what the filename already said. Only `applies`
  // carried anything, so the file was mostly noise (software.md).
  //
  // The column value is the cell; `<column>_note` is its prose. Both are
  // scalars, because a Bases table edits a cell inline and cannot edit a
  // nested map.
  const cells = new Map<string, Map<string, RigorMatrixCell>>();
  for (const row of rows) {
    const fm = fmByName.get(row.name)!;
    const per = new Map<string, RigorMatrixCell>();
    for (const col of ALL_COLUMNS) {
      // The explicit-N/A law survives the move: a missing key is "not yet
      // written" and refuses loudly, exactly as a missing file did.
      const applies = fm[col];
      if (typeof applies !== "string" || applies === "") {
        throw new Error(`matrix row ${row.name} is missing its ${col} cell — an N/A is an explicit value, never an absence`);
      }
      if (!APPLIES.has(applies)) throw new Error(`matrix row ${row.name} carries unknown applies value "${applies}" at ${col}`);
      const note = fm[`${col}_note`];
      per.set(col, {
        row: row.name,
        column: col as RigorMatrixColumn,
        applies: applies as RigorMatrixCell["applies"],
        body: typeof note === "string" ? note.trim() : "",
      });
    }
    cells.set(row.name, per);
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
/**
 * THE FLOOR LAW. Four rows carry `floor: true` and may never be tailored
 * away, whatever the change size: the deliberate start, the full battery,
 * re-documenting what changed, and the release gate. Everything above that
 * line is negotiable by size. These are not.
 *
 * The flag was parsed and read by nobody, so a cell edit could strike the
 * release gate and the whole suite would stay green.
 *
 * IT REFUSES RATHER THAN REPAIRING. Quietly keeping a struck floor step would
 * leave the matrix saying one thing and the machine doing another, which is
 * the same class of failure as a filter that ignores a clause. Striking one
 * on purpose means removing the flag, which is a visible, reviewable edit.
 */
export function assertFloor(matrix: RigorMatrix, column: ChangeColumn): void {
  const struck = matrix.rows.filter((r) => r.floor && matrix.cells.get(r.name)?.get(column)?.applies === "none");
  if (struck.length === 0) return;
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: `every floor step to apply at ${column} — the floor is ${matrix.rows
      .filter((r) => r.floor)
      .map((r) => r.name)
      .join(", ")}`,
    got: `${struck.map((r) => r.name).join(", ")} struck at ${column}`,
    remedy: {
      tool: "se_file_glob",
      args: { glob: `project/deliverable/machines/rigor_matrix/rows/*${struck[0].name}.md` },
      note: "give the cell a value, or drop `floor: true` if it is genuinely no longer a floor",
    },
    source: SRC,
  });
}

export function compileColumn(matrix: RigorMatrix, column: ChangeColumn): MachineDecl {
  assertFloor(matrix, column);
  const byName = new Map(matrix.rows.map((r) => [r.name, r]));
  const applied = new Set(matrix.rows.filter((r) => matrix.cells.get(r.name)?.get(column)?.applies !== "none").map((r) => r.name));
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
      if (!list) {
        list = [];
        edgesFrom.set(d, list);
      }
      if (row.edge_role === "fallback") {
        list.push({ to: row.name, role: "fallback", ...(row.guard ? { guard: row.guard } : {}) });
        // The recovery edge closes the loop back to the dependency.
        let back = edgesFrom.get(row.name);
        if (!back) {
          back = [];
          edgesFrom.set(row.name, back);
        }
        back.push({ to: d, role: "recovery" });
      } else {
        list.push({ to: row.name, role: byName.get(d)?.state_kind === "gate" ? "approval" : "normal" });
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
      // EVERY GATE CARRIES THE FOUR ROUNDS, and the compiler adds them so that
      // no row author can forget one. v2 recorded what happens otherwise: the
      // rounds were doctrine since meth-gate-review was written, no evidence
      // form ever collected them, and consequently NOT ONE was filled in any
      // gate of any iteration. The canvas compiler already did this; THIS one
      // did not, so the ten gates a real iteration walks carried none of them.
      evidence_form: row.state_kind === "gate" ? [...row.evidence_form, ...STANDARD_ROUNDS] : row.evidence_form,
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
