// Iterations — planned work, SEEDED AS A FUNCTION (owner design
// 2026-07-27; reshaped 2026-08-04): a seed mints the record and its
// worktree, and the iteration stands VISIBLE in the iterations container
// from that moment — standing in M0: the retro onboards, the kickoff
// sizes. The kickoff's bless pins the blessed column and the machine
// grows IN PLACE. The walk is FLAT: milestones are groups on the states,
// never sub-machines; only seeded chunk machines dive.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type CanvasData, type CanvasEdge, type CanvasElement, nodeSize } from "./canvas.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { buildArchive, type GeneratedMachine } from "./expmachine.ts";
import { type MachineDecl, type StateDecl, validateMachine } from "./machine.ts";
import { parseStateNote } from "./notes.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, compileM0, readRigorMatrix, rigorMatrixContentHash } from "./rigor-matrix.ts";
import { bustBranchList, listBranches, slug, worktreesDir } from "./worktree.ts";

const SRC = "engine/iterations.ts";

function git(root: string, args: string[], what: string): string {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Rejection({
      clause: CLAUSES.NOT_CONFIGURED,
      expected: `git ${what} to succeed`,
      got: (r.stderr ?? "").trim().slice(0, 500) || `exit ${r.status}`,
      remedy: { tool: "se_git", args: { args: ["status"] }, note: "inspect the repository state" },
      source: SRC,
    });
  }
  return r.stdout ?? "";
}

export interface Iteration {
  id: string;
  branch: string;
  path: string;
  open: boolean;
}

export function itRecordRel(id: string): string {
  return `project/spec/iterations/${id}/record.md`;
}

export function readItRecord(root: string, it: Iteration): Record<string, unknown> | undefined {
  const rel = itRecordRel(it.id);
  if (it.open) {
    const abs = join(it.path, rel);
    if (!existsSync(abs)) return undefined;
    return parseStateNote(readFileSync(abs, "utf8")).frontmatter;
  }
  const merged = join(root, rel);
  if (existsSync(merged)) return parseStateNote(readFileSync(merged, "utf8")).frontmatter;
  const r = spawnSync("git", ["show", `${it.branch}:${rel}`], { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) return undefined;
  return parseStateNote(r.stdout).frontmatter;
}

/** Open = the worktree exists. Closed = branch it/* without one. */
export function itList(root: string): Iteration[] {
  const out: Iteration[] = [];
  const branches = listBranches(root, "it/*");
  for (const branch of branches) {
    const id = branch.slice("it/".length);
    const path = join(worktreesDir(root), id);
    out.push({ id, branch, path, open: existsSync(path) });
  }
  return out.sort((a, b) => Number(a.id.match(/^i(\d+)/)?.[1] ?? 0) - Number(b.id.match(/^i(\d+)/)?.[1] ?? 0));
}

/** THE SEED: goal + rough vision, plus context inputs (an expedition id,
 *  retro note refs). Mints the record on its own branch and worktree —
 *  the iteration stands in the container at once. */
export function itSeed(root: string, goal: string, vision: string, inputs: string[] = []): Iteration {
  if (goal.trim() === "" || vision.trim() === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a goal AND a rough vision — the seed is a small form, not a slogan",
      got: goal.trim() === "" ? "an empty goal" : "an empty vision",
      remedy: {
        tool: "se_seed_iteration",
        args: { goal: "<what>", vision: "<roughly how / what done looks like>" },
        note: "inputs: [] may carry an expedition id or note refs",
      },
      source: SRC,
    });
  }
  const n =
    itList(root).reduce((max, it) => {
      const m = it.id.match(/^i(\d+)-/);
      return m ? Math.max(max, Number(m[1])) : max;
    }, 0) + 1;
  const id = `i${n}-${slug(goal)}`;
  const path = join(worktreesDir(root), id);
  mkdirSync(worktreesDir(root), { recursive: true });
  git(root, ["worktree", "add", path, "-b", `it/${id}`], "worktree add");
  // AFTER the branch exists, never before. Busting first only refills the
  // cache from the old listing, and the new iteration then stays invisible
  // for the length of the window.
  bustBranchList();
  const deliverable = join(path, "project", "deliverable");
  if (existsSync(join(deliverable, "package.json")) && !existsSync(join(deliverable, "node_modules"))) {
    spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: deliverable, stdio: "ignore", shell: process.platform === "win32" });
  }
  const recAbs = join(path, itRecordRel(id));
  mkdirSync(dirname(recAbs), { recursive: true });
  writeFileSync(
    recAbs,
    [
      "---",
      `id: ${id}`,
      "status: seeded",
      `opened: ${new Date().toISOString()}`,
      `goal: ${JSON.stringify(goal)}`,
      `vision: ${JSON.stringify(vision)}`,
      "inputs:",
      ...inputs.map((i) => `  - ${JSON.stringify(i)}`),
      "---",
      "",
      `# ${id}`,
      "",
      "## Goal",
      "",
      goal,
      "",
      "## Rough vision",
      "",
      vision,
      "",
      ...(inputs.length > 0 ? ["## Inputs", "", ...inputs.map((i) => `- ${i}`), ""] : []),
    ].join("\n"),
    "utf8",
  );
  git(path, ["add", "-A"], "add");
  git(path, ["commit", "-q", "-m", `iteration ${id}: seed`], "commit");
  return { id, branch: `it/${id}`, path, open: true };
}

export function itFind(root: string, id: string): Iteration {
  const it = itList(root).find((x) => x.id === id);
  if (it === undefined || !it.open) {
    const open = itList(root)
      .filter((x) => x.open)
      .map((x) => x.id);
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `an OPEN iteration: ${open.join(", ") || "(none — seed one first)"}`,
      got: id,
      remedy: {
        tool: "se_seed_iteration",
        args: { goal: "<what>", vision: "<roughly how>" },
        note: "the iterations container lists the seeded ones",
      },
      source: SRC,
    });
  }
  return it;
}

/** First entry stamps `started:` — from then on the needs-retro gate no
 *  longer holds this iteration (re-entering running work is never blocked). */
export function markStarted(_root: string, it: Iteration): void {
  const recAbs = join(it.path, itRecordRel(it.id));
  if (!existsSync(recAbs)) return;
  const raw = readFileSync(recAbs, "utf8");
  if (/^started: /m.test(raw)) return;
  writeFileSync(recAbs, raw.replace(/^status: seeded$/m, `status: open\nstarted: ${new Date().toISOString()}`), "utf8");
  git(it.path, ["add", "-A"], "add");
  git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: started`], "commit");
}

export function itPinRel(id: string): string {
  return `project/spec/iterations/${id}/machines/seeded.json`;
}

export function itSeededRel(id: string, kind: string): string {
  return `project/spec/iterations/${id}/machines/${kind}.md`;
}

/** THE SEEDED MACHINE (owner design 2026-07-30): an authoring state writes
 *  the drawing as markdown data in the record (machines/<kind>.md), and the
 *  matching runs-state descends into its compilation — build-chunks, spikes
 *  and candidates all share this one shape. Each step's realization kind
 *  becomes a TAG on its state, so the existing tag-pull serves each builder
 *  its discipline's guidance. An absent or empty drawing is a TYPED
 *  REFUSAL, never a plain serve — unless it carries an explicit none with
 *  its reason, which passes the run state without ceremony. */
function chunkList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim() !== "") return v.split(",").map((s) => s.trim());
  return [];
}

export function generateSeeded(_root: string, it: Iteration, machineId: string, kind: string): GeneratedMachine {
  const abs = join(it.path, itSeededRel(it.id, kind));
  const scaffold =
    '---\nsteps:\n  - id: <step>\n    statement: "<what this step builds or settles>"\n    depends_on: []\n    realization: software\n---\n';
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `a seeded drawing — the authoring state writes ${itSeededRel(it.id, kind)} (frontmatter steps: id, statement, depends_on, realization — or none: "<why nothing runs>")`,
      got: `no ${kind}.md in the iteration record — a run without visible steps is a defect`,
      remedy: {
        tool: "se_file_write",
        args: { path: itSeededRel(it.id, kind), content: scaffold, base_hash: null },
        note: "seed the drawing at the authoring state, then pull again",
      },
      source: SRC,
    });
  }
  const fm = parseStateNote(readFileSync(abs, "utf8")).frontmatter;
  const raw = Array.isArray(fm.steps) ? fm.steps : Array.isArray(fm.chunks) ? fm.chunks : [];
  interface Chunk {
    id: string;
    statement: string;
    depends_on: string[];
    realization: string;
  }
  const chunks: Chunk[] = raw.map((entry, i) => {
    const c = (entry ?? {}) as Record<string, unknown>;
    if (typeof c.id !== "string" || c.id.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `step ${i + 1} declares an id`,
        got: "a step without an id",
        remedy: {
          tool: "se_file_read",
          args: { path: itSeededRel(it.id, kind) },
          note: "every step carries id, statement, depends_on, realization",
        },
        source: SRC,
      });
    }
    return {
      id: c.id,
      statement: typeof c.statement === "string" ? c.statement : "",
      depends_on: chunkList(c.depends_on),
      realization: typeof c.realization === "string" && c.realization !== "" ? c.realization : "software",
    };
  });
  if (chunks.length === 0) {
    // AN EXPLICIT NONE passes the run state without ceremony — zero spikes
    // is a normal outcome when the drawing says WHY (the explicit-absence law).
    if (typeof fm.none === "string" && fm.none.trim() !== "") {
      const decl: MachineDecl = {
        id: machineId,
        reentry: "resume",
        initial: "start",
        states: [
          {
            id: "start",
            kind: "start",
            statement: "",
            guidance: `Nothing was seeded, explicitly: ${fm.none}`,
            evidence_form: [],
            priority: 0.01,
            edges: [{ to: "end", role: "normal" }],
          },
          {
            id: "end",
            kind: "end",
            statement: "",
            guidance: "The explicit none is recorded — pull once more to return to the walk.",
            evidence_form: [],
            priority: 0.01,
            edges: [],
          },
        ],
      };
      validateMachine(decl);
      return { decl, canvas: pinnedCanvas(decl), expByState: {} };
    }
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: 'at least one step in the drawing, or an explicit none: "<why nothing runs>"',
      got: `${kind}.md carries an empty steps list with no reason`,
      remedy: {
        tool: "se_file_patch",
        args: { ops: [{ path: itSeededRel(it.id, kind), old_string: "steps:", new_string: "steps:\n  - id: <step>" }] },
        note: "a run without visible steps is a defect — absence must say why",
      },
      source: SRC,
    });
  }
  const ids = new Set(chunks.map((c) => c.id));
  const start: StateDecl = {
    id: "start",
    kind: "start",
    statement: "",
    guidance: "The seeded chunk machine — the build plan as states, parallel where independent.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const dependents = new Set(chunks.flatMap((c) => c.depends_on));
  for (const c of chunks) {
    for (const d of c.depends_on) {
      if (!ids.has(d)) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `chunk ${c.id} depends on a declared chunk`,
          got: d,
          remedy: {
            tool: "se_file_read",
            args: { path: itSeededRel(it.id, kind) },
            note: "dependencies name chunk ids from the same drawing",
          },
          source: SRC,
        });
      }
    }
    if (c.depends_on.length === 0) start.edges.push({ to: c.id, role: "normal" });
    states.push({
      id: c.id,
      kind: "work",
      statement: c.statement,
      guidance: `A build chunk — realization: ${c.realization}. The tag pulls the discipline's guidance.`,
      evidence_form: [{ name: "built", description: "what was built and where — the commit or artifact", required: true }],
      priority: 0.2,
      tags: [`realization-${c.realization}`],
      edges: [
        ...chunks.filter((o) => o.depends_on.includes(c.id)).map((o) => ({ to: o.id, role: "normal" as const })),
        ...(dependents.has(c.id) ? [] : [{ to: "all-built", role: "normal" as const }]),
      ],
    });
  }
  // The JOIN: a build is done when EVERY leaf chunk is — plain fan-in
  // would be an OR, and one finished chunk is not a finished build.
  states.push({
    id: "all-built",
    kind: "join",
    statement: "",
    guidance: "Every chunk is built — the join releases the walk.",
    evidence_form: [],
    priority: 0.01,
    edges: [{ to: "end", role: "normal" }],
  });
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "The chunk machine is complete — pull once more to return to the walk.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id: machineId, reentry: "resume", initial: "start", states };
  validateMachine(decl);
  return { decl, canvas: pinnedCanvas(decl), expByState: {} };
}

/** The escalation ladder IS the column list — one source, so the two cannot
 *  drift apart. */
const SIZE_ORDER = CHANGE_COLUMNS as readonly string[];

/** THE PIN (owner verdicts 2026-07-30): the kickoff bless compiles the
 *  blessed change size from the LIVE rigor matrix and pins the machine into
 *  the record with its content hash. Rigor matrix edits reach the NEXT
 *  kickoff, never a running walk; drift stays silent until asked.
 *  Escalation = re-pinning with a LARGER size — monotonicity guarantees
 *  every filled state survives. De-escalation is refused: a prediction
 *  that proved too big is finished at its size. */
export function pinIteration(root: string, it: Iteration, changeSize: string): Record<string, unknown> {
  if (!(CHANGE_COLUMNS as readonly string[]).includes(changeSize)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a change size: ${CHANGE_COLUMNS.join(" | ")}`,
      got: changeSize,
      remedy: { tool: "se_pull", args: {}, note: "the kickoff's change_size field carries the choice" },
      source: SRC,
    });
  }
  const pinAbs = join(it.path, itPinRel(it.id));
  let prev: ParsedPin | undefined;
  if (existsSync(pinAbs)) {
    prev = parsePin(readFileSync(pinAbs, "utf8"));
    const from = SIZE_ORDER.indexOf(String(prev.change_size));
    const to = SIZE_ORDER.indexOf(changeSize);
    if (to <= from) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an ESCALATION — the pin stands at ${String(prev.change_size)}, and only a larger size re-opens it; a prediction that proved too big is finished at its size`,
        got: changeSize,
        remedy: { tool: "se_pull", args: {}, note: "walk the pinned machine as it stands" },
        source: SRC,
      });
    }
  }
  const rigorMatrix = readRigorMatrix(root);
  const machine = compileColumn(rigorMatrix, changeSize as ChangeColumn);
  // THE DEMANDS LEDGER: what each applied step asks at this pin — the
  // ordinal applies plus the evidence spec. The next escalation compares
  // against it.
  const demands: Record<string, StepDemand> = {};
  for (const row of rigorMatrix.rows) {
    const cell = rigorMatrix.cells.get(row.name)!.get(changeSize as ChangeColumn)!;
    if (cell.applies === "none") continue;
    demands[row.name] = { applies: cell.applies, evidence: JSON.stringify(row.evidence_form) };
  }
  // REOPEN (owner verdict 2026-07-30): a filled step survives the
  // escalation only while its demand stands. applies stepped up, or the
  // evidence spec changed — the step reopens and its evidence is
  // re-earned. Guidance-only wording never reopens.
  const reopened = Object.keys(prev?.demands ?? {})
    .filter((id) => {
      const o = prev?.demands?.[id];
      const n = demands[id];
      return (
        n !== undefined && (o === undefined || (APPLIES_RANK[n.applies] ?? 0) > (APPLIES_RANK[o.applies] ?? 0) || n.evidence !== o.evidence)
      );
    })
    .sort();
  const pin = {
    change_size: changeSize,
    rigor_matrix_hash: rigorMatrixContentHash(root),
    pinned_at: new Date().toISOString(),
    ...(reopened.length > 0 ? { reopened } : {}),
    demands,
    machine,
  };
  mkdirSync(dirname(pinAbs), { recursive: true });
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");
  git(it.path, ["add", "-A"], "add");
  git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: pin ${changeSize}`], "commit");
  return {
    pinned: changeSize,
    rigor_matrix_hash: pin.rigor_matrix_hash,
    states: machine.states.length,
    ...(reopened.length > 0 ? { reopened } : {}),
  };
}

interface StepDemand {
  applies: string;
  evidence: string;
}

/** tailored is always tailored DOWN (owner ruling 2026-07-30); inherit
 *  defers to the fuller content, so it ranks with full. */
const APPLIES_RANK: Record<string, number> = { none: 0, tailored: 1, inherit: 2, full: 2 };

interface ParsedPin {
  change_size?: string;
  demands?: Record<string, StepDemand>;
}

function parsePin(raw: string): ParsedPin {
  try {
    return JSON.parse(raw) as ParsedPin;
  } catch {
    return {};
  }
}

export function itShortId(itId: string): string {
  const m = itId.match(/^(i\d+)-/);
  return m ? m[1] : itId;
}

/** THE ITERATIONS CONTAINER, generated: every open iteration is ONE node
 *  whose machine is the iteration's own walk — M0 alone until the
 *  kickoff's bless pins a column, the full pinned machine after. The walk
 *  shows FLAT: milestones are groups on the states, never sub-machines
 *  (owner ruling 2026-08-04). Nothing open: start runs to end. */
export function generateIterations(root: string): GeneratedMachine {
  let open: Iteration[] = [];
  try {
    open = itList(root).filter((it) => it.open);
  } catch {
    open = [];
  }
  const start: StateDecl = {
    id: "start",
    kind: "start",
    statement: "",
    guidance:
      "The seeded container: every open iteration stands as its own machine. Entering one binds its worktree and stamps it started.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  const subGen: Record<string, () => GeneratedMachine> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];
  const centerY = open.length === 0 ? 80 : ((open.length - 1) * 420) / 2 + 80;
  nodes.push({
    id: "n-start",
    type: "file",
    file: "start.md",
    x: -1400,
    y: centerY,
    width: 160,
    height: 160,
    styleAttributes: { shape: "pill" },
  });
  nodes.push({
    id: "n-end",
    type: "file",
    file: "end.md",
    x: 260,
    y: centerY,
    width: 160,
    height: 160,
    styleAttributes: { shape: "pill" },
  });
  open.forEach((it, i) => {
    const sid = itShortId(it.id);
    const fm = readItRecord(root, it);
    const goal = typeof fm?.goal === "string" ? fm.goal : it.id;
    expByState[sid] = it.id;
    states.push({
      id: sid,
      kind: "work",
      statement: goal,
      guidance:
        "The iteration's own machine — enter it and the walk stands in M0: the retro onboards, the kickoff proposes a size, and the bless pins the full column. Goal, vision and inputs live in the record.",
      evidence_form: [],
      priority: 0.2,
      submachine: "generated",
      edges: [{ to: "end", role: "normal" }],
    });
    subGen[sid] = () => generateIterationWalk(root, it, sid);
    start.edges.push({ to: sid, role: "normal" });
    const y = i * 420;
    nodes.push({ id: `n-${sid}`, type: "file", file: `${sid}.md`, x: -1100, y, ...nodeSize(sid, goal) });
    edges.push({ id: `e-start-${sid}`, fromNode: "n-start", toNode: `n-${sid}` });
    edges.push({ id: `e-${sid}-end`, fromNode: `n-${sid}`, toNode: "n-end" });
  });
  if (open.length === 0) {
    start.edges.push({ to: "end", role: "normal" });
    edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  }
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "Left the iterations container — running work parks where it stands; a seeded one waits in M0.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  });
  const decl: MachineDecl = { id: "iterations", reentry: "restart", initial: "start", states };
  validateMachine(decl);
  const canvas: CanvasData = {
    nodes: nodes as CanvasElement[],
    edges,
    metadata: { frontmatter: { reentry: "restart", priority: 0.4 } },
  };
  return { decl, canvas, expByState, ...(Object.keys(subGen).length > 0 ? { subGen } : {}) };
}

/** The iteration's machine, read at CALL time: the pinned column when the
 *  pin stands, the M0 seed machine otherwise — the same machine id either
 *  way, so evidence keys and history survive the pin swap. */
function generateIterationWalk(root: string, it: Iteration, sid: string): GeneratedMachine {
  let pinned: { machine?: MachineDecl } | undefined;
  try {
    pinned = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { machine?: MachineDecl };
  } catch {
    pinned = undefined;
  }
  const m: MachineDecl = pinned?.machine !== undefined ? { ...pinned.machine, id: sid } : compileM0(readRigorMatrix(root), sid);
  return {
    decl: m,
    canvas: pinnedCanvas(m),
    expByState: {},
    subGen: Object.fromEntries(
      m.states.filter((s) => s.submachine !== undefined).map((s) => [s.id, () => generateSeeded(root, it, s.id, s.submachine!)]),
    ),
  };
}

/** A drawn view of a pinned machine: milestone columns, states stacked in
 *  reading order — generated, like every container view. */
function pinnedCanvas(m: MachineDecl): CanvasData {
  const cols: string[] = [];
  for (const s of m.states) {
    const g = s.kind === "start" ? "" : (s.group ?? "?");
    if (!cols.includes(g)) cols.push(g);
  }
  const nodes: CanvasElement[] = [];
  const edges: CanvasEdge[] = [];
  const rows: Record<string, number> = {};
  for (const s of m.states) {
    const g = s.kind === "start" ? "" : (s.group ?? "?");
    const col = cols.indexOf(g);
    const row = rows[g] ?? 0;
    rows[g] = row + 1;
    nodes.push({ id: `n-${s.id}`, type: "file", file: `${s.id}.md`, x: col * 560, y: row * 260, ...nodeSize(s.id, s.statement) });
  }
  for (const s of m.states) {
    for (const e of s.edges) {
      edges.push({ id: `e-${s.id}-${e.to}`, fromNode: `n-${s.id}`, toNode: `n-${e.to}` });
    }
  }
  return { nodes, edges, metadata: { frontmatter: { reentry: "resume", priority: 0.2 } } };
}

/** THE ITERATION ARCHIVE, generated like the expedition archive — the
 *  same decade shape (owner ruling: both archives). */
export function generateIterationArchive(root: string): GeneratedMachine {
  let closed: Iteration[] = [];
  try {
    closed = itList(root).filter((it) => !it.open);
  } catch {
    closed = [];
  }
  const entries = closed.map((it) => {
    const fm = readItRecord(root, it);
    return { sid: itShortId(it.id), full: it.id, goal: typeof fm?.goal === "string" ? fm.goal : "" };
  });
  return buildArchive("iteration_archive", entries, "iteration");
}
