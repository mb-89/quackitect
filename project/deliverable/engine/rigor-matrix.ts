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
  /** Set when the row IS another machine's state, by reference. */
  same_as?: string;
  /** Entry conditions inherited from the referenced state note. */
  entry?: Record<string, string[]>;
  /** WHY the step exists — one authored line for its evidence form. */
  motivation?: string;
  /** Declared do-inputs beyond the reading. */
  inputs?: { label: string; description: string }[];
  /** The concrete slash-name of the form's Follow-up box. */
  follow_up_label?: string;
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

/** "label | description" lines — a state's do-inputs beyond the reading. */
function parseDoInputs(v: unknown): { label: string; description: string }[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.map(String).map((line) => {
    const cut = line.indexOf("|");
    return cut < 0
      ? { label: line.trim(), description: "" }
      : { label: line.slice(0, cut).trim(), description: line.slice(cut + 1).trim() };
  });
  return out.length > 0 ? out : undefined;
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
  return raw.map((entry, i) => evidenceField(file, entry, i));
}

function evidenceField(file: string, entry: unknown, i: number): EvidenceField {
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
    throw new Error(`matrix row ${file} field ${f.name}: unknown evidence type "${String(f.type)}" — one of ${EVIDENCE_TYPES.join(", ")}`);
  }
  return {
    name: f.name,
    description: typeof f.description === "string" ? f.description : "",
    required: f.required !== false,
    ...(f.type !== undefined ? { type: String(f.type) as EvidenceType } : {}),
    ...(typeof f.guidance === "string" && f.guidance.trim() !== "" ? { guidance: f.guidance } : {}),
    ...(typeof f.template === "string" && f.template.trim() !== "" ? { template: f.template } : {}),
    ...(typeof f.of === "string" && f.of.trim() !== "" ? { of: f.of.trim() } : {}),
    ...(typeof f.covers === "string" && f.covers.trim() !== "" ? { covers: f.covers.trim() } : {}),
    ...(Array.isArray(f.options) ? { options: f.options.map(String) } : {}),
    ...(Array.isArray(f.items) ? { items: f.items.map(String) } : {}),
    ...(Array.isArray(f.passing) ? { passing: f.passing.map(String) } : {}),
    ...(Array.isArray(f.columns) ? { columns: f.columns.map(String) } : {}),
  };
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

function parseMatrixRow(
  dir: string,
  file: string,
  byName: Map<string, RigorMatrixRow>,
): { row: RigorMatrixRow; fm: Record<string, unknown> } {
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
    motivation: typeof fm.motivation === "string" ? fm.motivation : undefined,
    inputs: parseDoInputs(fm.inputs),
    follow_up_label: typeof fm.follow_up_label === "string" ? fm.follow_up_label : undefined,
    // A ROW MAY DEMAND ITS OWN METHOD. A state note has always been able to;
    // a row could only inherit one through same_as, so a step whose method is
    // not common knowledge had no way to make it a condition of entry.
    entry: fm.entry_read === undefined ? undefined : { read: asList(fm.entry_read) },
  };
  if (row.state_kind !== "terminal" && row.evidence_form.length === 0) {
    throw new Error(`matrix row ${row.name} carries no evidence — leaving a state demands evidence; only a terminal is exempt`);
  }
  mergeSameAs(dir, row, fm);
  return { row, fm };
}

/** A MIRROR IS A REFERENCE, NEVER A COPY (owner law 2026-08-04). A row
 *  carrying `same_as: <state>` IS that state, standing in the walk: how it
 *  WORKS — its tools, its guidance, its entry reading — comes from the ONE
 *  note in machines/states/, read here so an edit there reaches both. The
 *  row keeps only its seam: statement, evidence, dependencies, cells. */
function mergeSameAs(dir: string, row: RigorMatrixRow, fm: Record<string, unknown>): void {
  if (typeof fm.same_as !== "string" || fm.same_as === "") return;
  const note = parseStateNote(readFileSync(join(dir, "..", "states", `${fm.same_as}.md`), "utf8"));
  const nfm = note.frontmatter;
  row.same_as = fm.same_as;
  if (nfm.legal_tools !== undefined) row.legal_tools = asList(nfm.legal_tools);
  if (typeof nfm.guidance === "string" && nfm.guidance !== "") row.guidance = [nfm.guidance, row.guidance].filter(Boolean).join("\n\n");
  if (nfm.entry_read !== undefined) row.entry = { read: asList(nfm.entry_read) };
  if (typeof nfm.motivation === "string" && nfm.motivation !== "") row.motivation = nfm.motivation;
  if (typeof nfm.follow_up_label === "string" && nfm.follow_up_label !== "") row.follow_up_label = nfm.follow_up_label;
  const di = parseDoInputs(nfm.inputs);
  if (di !== undefined) row.inputs = di;
}

// A CELL IS FRONTMATTER ON ITS ROW. It used to be a file of its own, and
// three of that file's four keys echoed its own name — kind, row and
// column all restated what the filename already said. Only `applies`
// carried anything, so the file was mostly noise (software.md).
//
// The column value is the cell; `<column>_note` is its prose. Both are
// scalars, because a Bases table edits a cell inline and cannot edit a
// nested map.
function cellsOf(rows: RigorMatrixRow[], fmByName: Map<string, Record<string, unknown>>): Map<string, Map<string, RigorMatrixCell>> {
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
  return cells;
}

function readRigorMatrixFresh(root: string): RigorMatrix {
  const dir = matrixDir(root);
  const rows: RigorMatrixRow[] = [];
  const byName = new Map<string, RigorMatrixRow>();
  const fmByName = new Map<string, Record<string, unknown>>();
  for (const file of readdirSync(join(dir, "rows"))
    .filter((f) => f.endsWith(".md"))
    .sort()) {
    const { row, fm } = parseMatrixRow(dir, file, byName);
    rows.push(row);
    byName.set(row.name, row);
    fmByName.set(row.name, fm);
  }
  for (const row of rows) {
    for (const d of row.depends_on) {
      if (!byName.has(d)) throw new Error(`matrix row ${row.name} depends on undeclared row ${d}`);
    }
  }
  return { rows, cells: cellsOf(rows, fmByName) };
}

/** Priority anchors per state kind (the autonomy scale's bands). */
function priorityOf(row: RigorMatrixRow): number {
  if (row.state_kind === "terminal") return 0.01;
  if (row.filled_by === "engine") return 0.01;
  if (row.state_kind === "gate") return 0.6;
  return 0.2;
}

/** What a row compiles to, minus what differs per compilation: guidance
 *  source, sub-machine descent and edges. Both compilers spread this, so
 *  the gate rounds and the kickoff tag cannot drift apart. */
function rowState(row: RigorMatrixRow): Omit<StateDecl, "guidance" | "edges"> {
  return {
    id: row.name,
    kind: row.state_kind,
    group: row.milestone,
    statement: row.statement,
    filled_by: row.filled_by,
    ...(row.command ? { command: row.command } : {}),
    // EVERY GATE CARRIES THE FOUR ROUNDS, and the compiler adds them so that
    // no row author can forget one. v2 recorded what happens otherwise: the
    // rounds were doctrine since meth-gate-review was written, no evidence
    // form ever collected them, and consequently NOT ONE was filled in any
    // gate of any iteration.
    evidence_form: row.state_kind === "gate" ? [...row.evidence_form, ...STANDARD_ROUNDS] : row.evidence_form,
    priority: priorityOf(row),
    // Absent stays minimal — the always-legal three and nothing else. The
    // kickoff sets each state's rights, so a row opens only what it declares.
    // A state must declare enough to execute the remedy its own refusal hands
    // back, or SE-C-112 answers with SE-C-110 and the walk cannot recover.
    ...(row.legal_tools !== undefined ? { legal_tools: row.legal_tools } : {}),
    ...(row.same_as !== undefined ? { same_as: row.same_as } : {}),
    ...(row.entry !== undefined ? { entry: row.entry } : {}),
    ...(row.motivation !== undefined ? { motivation: row.motivation } : {}),
    ...(row.inputs !== undefined ? { inputs: row.inputs } : {}),
    ...(row.follow_up_label !== undefined ? { follow_up_label: row.follow_up_label } : {}),
    // The walk's pin hook finds the kickoff by this tag, wherever it compiles.
    ...(row.name === "gate-kickoff" ? { tags: ["iteration-kickoff"] } : {}),
  };
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

/** The surviving rows' contracted dependency edges: struck rows vanish and
 *  dependencies pass transitively through them, so the walk stays connected. */
function columnEdges(
  matrix: RigorMatrix,
  applied: Set<string>,
  byName: Map<string, RigorMatrixRow>,
): { edgesFrom: Map<string, EdgeDecl[]>; roots: string[] } {
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
  const listOf = (m: Map<string, EdgeDecl[]>, key: string): EdgeDecl[] => {
    let list = m.get(key);
    if (!list) {
      list = [];
      m.set(key, list);
    }
    return list;
  };
  const edgesFrom = new Map<string, EdgeDecl[]>();
  const roots: string[] = [];
  for (const row of matrix.rows) {
    if (!applied.has(row.name)) continue;
    const deps = [...new Set(row.depends_on.flatMap((d) => resolve(d, new Set([row.name]))))].filter((d) => d !== row.name);
    if (deps.length === 0) roots.push(row.name);
    for (const d of deps) {
      if (row.edge_role === "fallback") {
        listOf(edgesFrom, d).push({ to: row.name, role: "fallback", ...(row.guard ? { guard: row.guard } : {}) });
        // The recovery edge closes the loop back to the dependency.
        listOf(edgesFrom, row.name).push({ to: d, role: "recovery" });
      } else {
        listOf(edgesFrom, d).push({ to: row.name, role: byName.get(d)?.state_kind === "gate" ? "approval" : "normal" });
      }
    }
  }
  return { edgesFrom, roots };
}

export function compileColumn(matrix: RigorMatrix, column: ChangeColumn): MachineDecl {
  assertFloor(matrix, column);
  const byName = new Map(matrix.rows.map((r) => [r.name, r]));
  const applied = new Set(matrix.rows.filter((r) => matrix.cells.get(r.name)?.get(column)?.applies !== "none").map((r) => r.name));
  const { edgesFrom, roots } = columnEdges(matrix, applied, byName);
  const states: StateDecl[] = [];

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
      ...rowState(row),
      guidance: [cell.body, row.guidance].filter(Boolean).join("\n\n"),
      ...(row.runs ? { submachine: row.runs } : {}),
      edges: edgesFrom.get(row.name) ?? [],
    });
  }
  const decl: MachineDecl = { id: `iteration-${column}`, reentry: "resume", initial: "start", states };
  validateMachine(decl);
  return decl;
}

/** THE SEED MACHINE (owner ruling 2026-08-04): every iteration stands in
 *  M0 from the moment it is seeded — the retro onboards, then the kickoff
 *  sizes. No column exists yet, so only the M0 rows compile, on their own
 *  guidance. The kickoff's bless pins the full column and the machine
 *  grows IN PLACE: the machine id and the state ids are stable, so filled
 *  M0 states and their evidence carry over. */
export function compileM0(matrix: RigorMatrix, id: string): MachineDecl {
  const rows = matrix.rows.filter((r) => r.milestone === "M0");
  const inSet = (name: string) => rows.some((r) => r.name === name);
  const roleFrom = (row: RigorMatrixRow) => (row.state_kind === "gate" ? ("approval" as const) : ("normal" as const));
  const states: StateDecl[] = [
    {
      id: "start",
      kind: "start",
      statement: "",
      guidance: "The seeded iteration: M0 first. The retro onboards, the kickoff proposes a size, and the bless pins the rest.",
      evidence_form: [],
      priority: 0.01,
      edges: rows.filter((r) => r.depends_on.every((d) => !inSet(d))).map((r) => ({ to: r.name, role: "normal" as const })),
    },
  ];
  for (const row of rows) {
    const dependents = rows.filter((o) => o.depends_on.includes(row.name));
    states.push({
      ...rowState(row),
      guidance: row.guidance,
      edges: dependents.length > 0 ? dependents.map((o) => ({ to: o.name, role: roleFrom(row) })) : [{ to: "end", role: roleFrom(row) }],
    });
  }
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "The kickoff is blessed and the column pinned — the walk continues in the grown machine.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id, reentry: "resume", initial: "start", states };
  validateMachine(decl);
  return decl;
}
