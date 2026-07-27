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
import { type CanvasData, type CanvasEdge, type CanvasElement } from "./canvas.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { validateMachine, type MachineDecl, type StateDecl } from "./machine.ts";
import { parseStateNote } from "./notes.ts";
import { type GeneratedMachine } from "./expmachine.ts";
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
  return out;
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
    statement: "Start",
    guidance: "The seeded container: every open iteration stands as its KICKOFF. Entering one binds its worktree and stamps it started.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
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
    states.push({
      id: sid,
      kind: "work",
      statement: goal,
      guidance:
        "KICKOFF — one brief carries plan and rigor; the owner blesses, and past it the iteration is set. Its outcome seeds the REST of this machine (the iteration lane builds that next). Goal, vision and inputs live in the record.",
      evidence_form: [],
      priority: 0.6,
      ...(started ? {} : { entry: { no_pending_note: ["needs retro"] } }),
      tags: ["iteration-kickoff"],
      edges: [{ to: "end", role: "alternative" }],
    });
    start.edges.push({ to: sid, role: "normal" });
    const y = i * 420;
    nodes.push({ id: `n-${sid}`, type: "file", file: `${sid}.md`, x: -1100, y, width: 620, height: 360 });
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
    statement: "End",
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
  return { decl, canvas, expByState };
}
