// Iterations — planned work, SEEDED AS A FUNCTION (owner design
// 2026-07-27): a seed mints the record and its worktree, and the
// iteration stands VISIBLE in the iterations container from that moment —
// a machine holding only its KICKOFF (v2's opening gate: one brief carries
// plan and rigor, the owner blesses). The kickoff's outcome seeds the
// rest; that lane is the next build. The needs-retro gate holds the FIRST
// start of a never-walked iteration — never the seeding.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { nodeSize, type CanvasData, type CanvasEdge, type CanvasElement } from "./canvas.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { validateMachine, type EvidenceField, type MachineDecl, type StateDecl } from "./machine.ts";
import { CHANGE_COLUMNS, compileColumn, matrixContentHash, readMatrix, type ChangeColumn } from "./matrix.ts";
import { parseStateNote } from "./notes.ts";
import { buildArchive, type GeneratedMachine } from "./expmachine.ts";
import { slug, worktreesDir } from "./worktree.ts";

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
  return `product/spec/iterations/${id}/record.md`;
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
  const branches = git(root, ["branch", "--list", "it/*", "--format=%(refname:short)"], "branch --list")
    .split("\n")
    .map((b) => b.trim())
    .filter((b) => b !== "");
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
      remedy: { tool: "se_seed_iteration", args: { goal: "<what>", vision: "<roughly how / what done looks like>" }, note: "inputs: [] may carry an expedition id or note refs" },
      source: SRC,
    });
  }
  const n = itList(root).reduce((max, it) => {
    const m = it.id.match(/^i(\d+)-/);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0) + 1;
  const id = `i${n}-${slug(goal)}`;
  const path = join(worktreesDir(root), id);
  mkdirSync(worktreesDir(root), { recursive: true });
  git(root, ["worktree", "add", path, "-b", `it/${id}`], "worktree add");
  const deliverable = join(path, "product", "deliverable");
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
    const open = itList(root).filter((x) => x.open).map((x) => x.id);
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `an OPEN iteration: ${open.join(", ") || "(none — seed one first)"}`,
      got: id,
      remedy: { tool: "se_seed_iteration", args: { goal: "<what>", vision: "<roughly how>" }, note: "the iterations container lists the seeded ones" },
      source: SRC,
    });
  }
  return it;
}

/** First entry stamps `started:` — from then on the needs-retro gate no
 *  longer holds this iteration (re-entering running work is never blocked). */
export function markStarted(root: string, it: Iteration): void {
  const recAbs = join(it.path, itRecordRel(it.id));
  if (!existsSync(recAbs)) return;
  const raw = readFileSync(recAbs, "utf8");
  if (/^started: /m.test(raw)) return;
  writeFileSync(recAbs, raw.replace(/^status: seeded$/m, `status: open\nstarted: ${new Date().toISOString()}`), "utf8");
  git(it.path, ["add", "-A"], "add");
  git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: started`], "commit");
}

export function itPinRel(id: string): string {
  return `product/spec/iterations/${id}/machines/seeded.json`;
}

const SIZE_ORDER = ["patch", "minor", "major"];

/** THE PIN (owner verdicts 2026-07-30): the kickoff bless compiles the
 *  blessed change size from the LIVE matrix and pins the machine into the
 *  record with the matrix content hash. Matrix edits reach the NEXT
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
      remedy: { tool: "se_tick", args: {}, note: "the kickoff's change_size field carries the choice" },
      source: SRC,
    });
  }
  const pinAbs = join(it.path, itPinRel(it.id));
  if (existsSync(pinAbs)) {
    const prev = parsePin(readFileSync(pinAbs, "utf8"));
    const from = SIZE_ORDER.indexOf(String(prev.change_size));
    const to = SIZE_ORDER.indexOf(changeSize);
    if (to <= from) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an ESCALATION — the pin stands at ${String(prev.change_size)}, and only a larger size re-opens it; a prediction that proved too big is finished at its size`,
        got: changeSize,
        remedy: { tool: "se_tick", args: {}, note: "walk the pinned machine as it stands" },
        source: SRC,
      });
    }
  }
  const machine = compileColumn(readMatrix(root), changeSize as ChangeColumn);
  const pin = {
    change_size: changeSize,
    matrix_hash: matrixContentHash(root),
    pinned_at: new Date().toISOString(),
    machine,
  };
  mkdirSync(dirname(pinAbs), { recursive: true });
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");
  git(it.path, ["add", "-A"], "add");
  git(it.path, ["commit", "-q", "-m", `iteration ${it.id}: pin ${changeSize}`], "commit");
  return { pinned: changeSize, matrix_hash: pin.matrix_hash, states: machine.states.length };
}

function parsePin(raw: string): { change_size?: string } {
  try {
    return JSON.parse(raw) as { change_size?: string };
  } catch {
    return {};
  }
}

export function itShortId(itId: string): string {
  const m = itId.match(/^(i\d+)-/);
  return m ? m[1] : itId;
}

/** THE ITERATIONS CONTAINER, generated: every open iteration stands as
 *  its KICKOFF state. Never-started ones carry the needs-retro gate on
 *  entry. Nothing open: start runs to end. */
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
    guidance: "The seeded container: every open iteration stands as its KICKOFF. Entering one binds its worktree and stamps it started.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  const subGen: Record<string, () => GeneratedMachine> = {};
  // The kickoff's evidence form is the matrix's OWN gate-kickoff row, read
  // live (seed-from-source). An unreadable matrix never takes the
  // container down — the kickoff then serves without a form.
  let kickoffEvidence: EvidenceField[] = [];
  try {
    kickoffEvidence = readMatrix(root).rows.find((r) => r.name === "gate-kickoff")?.evidence_form ?? [];
  } catch {
    kickoffEvidence = [];
  }
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];
  const centerY = open.length === 0 ? 80 : ((open.length - 1) * 420) / 2 + 80;
  nodes.push({ id: "n-start", type: "file", file: "start.md", x: -1400, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });
  nodes.push({ id: "n-end", type: "file", file: "end.md", x: 260, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });
  open.forEach((it, i) => {
    const sid = itShortId(it.id);
    const fm = readItRecord(root, it);
    const goal = typeof fm?.goal === "string" ? fm.goal : it.id;
    const started = typeof fm?.started === "string";
    expByState[sid] = it.id;
    // A PINNED iteration expands: the kickoff leads into the pinned machine
    // (a generated sub the reader clicks into), not straight to end.
    let pinned: { change_size?: string; machine?: MachineDecl } | undefined;
    try {
      pinned = JSON.parse(readFileSync(join(it.path, itPinRel(it.id)), "utf8")) as { change_size?: string; machine?: MachineDecl };
    } catch {
      pinned = undefined;
    }
    const walkId = `${sid}-walk`;
    const hasWalk = pinned?.machine !== undefined;
    states.push({
      id: sid,
      kind: "work",
      statement: goal,
      guidance:
        "KICKOFF — one brief carries plan and rigor; the owner blesses, and past it the iteration is set. The bless SEEDS the rest: the engine compiles the blessed change_size from the live matrix and pins the machine into the record. Goal, vision and inputs live in the record.",
      evidence_form: kickoffEvidence,
      priority: 0.6,
      ...(started ? {} : { entry: { no_pending_note: ["needs retro"] } }),
      tags: ["iteration-kickoff"],
      edges: [hasWalk ? { to: walkId, role: "normal" as const } : { to: "end", role: "alternative" as const }],
    });
    if (hasWalk) {
      const m = pinned!.machine!;
      expByState[walkId] = it.id;
      states.push({
        id: walkId,
        kind: "work",
        statement: `the pinned ${String(pinned!.change_size)} walk (${m.states.length} states)`,
        guidance: "The pinned machine — compiled from the matrix at the kickoff bless, pinned to the record. Click in; the walk continues inside. Matrix edits reach the NEXT kickoff, never this walk.",
        evidence_form: [],
        priority: 0.2,
        submachine: "generated",
        edges: [{ to: "end", role: "alternative" }],
      });
      subGen[walkId] = () => ({ decl: { ...m, id: walkId }, canvas: pinnedCanvas(m), expByState: {} });
    }
    start.edges.push({ to: sid, role: "normal" });
    const y = i * 420;
    nodes.push({ id: `n-${sid}`, type: "file", file: `${sid}.md`, x: -1100, y, ...nodeSize(sid, goal) });
    edges.push({ id: `e-start-${sid}`, fromNode: "n-start", toNode: `n-${sid}` });
    if (hasWalk) {
      nodes.push({ id: `n-${walkId}`, type: "file", file: `${walkId}.md`, x: -560, y, ...nodeSize(walkId) });
      edges.push({ id: `e-${sid}-${walkId}`, fromNode: `n-${sid}`, toNode: `n-${walkId}` });
      edges.push({ id: `e-${walkId}-end`, fromNode: `n-${walkId}`, toNode: "n-end" });
    } else {
      edges.push({ id: `e-${sid}-end`, fromNode: `n-${sid}`, toNode: "n-end" });
    }
  });
  if (open.length === 0) {
    start.edges.push({ to: "end", role: "normal" });
    edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  }
  states.push({
    id: "end",
    kind: "end",
    statement: "",
    guidance: "Left the iterations container — running work parks where it stands; a seeded one waits for its first start.",
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
