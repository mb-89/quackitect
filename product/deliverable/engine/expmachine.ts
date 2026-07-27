// continue_expedition is GENERATED, not drawn (owner design 2026-07-27):
// its states ARE the open expeditions, read from their records at entry.
// The standard expedition machine stays AUTHORED — states/work.md and
// states/leave.md are the single source; the generator instantiates them
// once per open expedition (id, statement and edges overridden). The
// human clicks the expedition to enter; ONE reaching end completes the
// machine, the others stay parked. Nothing open: start runs to end.
// The drawn continue_expedition.canvas is a stub saying exactly this.
import { join } from "node:path";
import { type CanvasData, type CanvasEdge, type CanvasElement } from "./canvas.ts";
import { validateMachine, type MachineDecl, type StateDecl } from "./machine.ts";
import { stateFromNote } from "./machines/compile.ts";
import { expList, readRecord } from "./worktree.ts";

export interface GeneratedMachine {
  decl: MachineDecl;
  canvas: CanvasData;
  /** state id (e5, e5-leave) → the full expedition id it belongs to. */
  expByState: Record<string, string>;
}

export function shortId(expId: string): string {
  const m = expId.match(/^(e\d+)-/);
  return m ? m[1] : expId;
}

function mechanical(id: string, kind: "start" | "end"): StateDecl {
  return {
    id,
    kind,
    statement: kind === "start" ? "Start" : "End",
    guidance:
      kind === "start"
        ? "The seeded container: every open expedition stands as its own states. Pick ONE way forward — entering an expedition binds its worktree."
        : "One expedition came home (or nothing was open) — the machine is complete here. The others stay parked for the next entry.",
    evidence_form: [],
    priority: 0.01,
    edges: [],
  };
}

/** expList needs a git repository — a bare root simply has none. */
function safeExpList(root: string): ReturnType<typeof expList> {
  try {
    return expList(root);
  } catch {
    return [];
  }
}

export function generateContinueExpedition(root: string): GeneratedMachine {
  const open = safeExpList(root).filter((e) => e.open);
  const notesDir = join(root, "product", "deliverable", "machines", "states");
  const workTpl = stateFromNote("continue_expedition", "states/work.md", join(notesDir, "work.md"), root);
  const leaveTpl = stateFromNote("continue_expedition", "states/leave.md", join(notesDir, "leave.md"), root);

  const start = mechanical("start", "start");
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];

  const centerY = open.length === 0 ? 80 : ((open.length - 1) * 560) / 2 + 100;
  nodes.push({ id: "n-start", type: "file", file: "start.md", x: -1400, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });
  nodes.push({ id: "n-end", type: "file", file: "end.md", x: 1240, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });

  open.forEach((e, i) => {
    const sid = shortId(e.id);
    const goal = String(readRecord(root, e)?.goal ?? "");
    const workId = sid;
    const leaveId = `${sid}-leave`;
    expByState[workId] = e.id;
    expByState[leaveId] = e.id;
    states.push({ ...workTpl, id: workId, statement: goal !== "" ? goal : e.id, edges: [{ to: leaveId, role: "normal" }] });
    // ALTERNATIVE into end — normal edges would AND-join: end would wait
    // for EVERY expedition, and one coming home is the whole point.
    states.push({ ...leaveTpl, id: leaveId, statement: `Leave ${sid}`, edges: [{ to: "end", role: "alternative" }] });
    start.edges.push({ to: workId, role: "normal" });
    const y = i * 560;
    nodes.push({ id: `g-${sid}`, type: "group", x: -800, y: y - 60, width: 1720, height: 480, label: e.id });
    nodes.push({ id: `n-${workId}`, type: "file", file: `${workId}.md`, x: -740, y, width: 620, height: 360 });
    nodes.push({ id: `n-${leaveId}`, type: "file", file: `${leaveId}.md`, x: 140, y, width: 620, height: 360 });
    edges.push({ id: `e-start-${workId}`, fromNode: "n-start", toNode: `n-${workId}` });
    edges.push({ id: `e-${workId}-${leaveId}`, fromNode: `n-${workId}`, toNode: `n-${leaveId}` });
    edges.push({ id: `e-${leaveId}-end`, fromNode: `n-${leaveId}`, toNode: "n-end" });
  });
  if (open.length === 0) {
    start.edges.push({ to: "end", role: "normal" });
    edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  }
  states.push(mechanical("end", "end"));

  const decl: MachineDecl = { id: "continue_expedition", reentry: "restart", initial: "start", states };
  validateMachine(decl);
  const canvas: CanvasData = {
    nodes: nodes as CanvasElement[],
    edges,
    metadata: { frontmatter: { reentry: "restart", priority: 0.4 } },
  };
  return { decl, canvas, expByState };
}

/** THE ARCHIVE, generated (owner design 2026-07-27): every CLOSED
 *  expedition stands as its own read-only state — a gallery of dead
 *  machines, all in parallel. None is reachable from start (the walk runs
 *  start → end past them); each carries an edge to end so the drawing
 *  validates. Clicking one shows what the expedition did. */
export function generateExpeditionArchive(root: string): GeneratedMachine {
  const closed = safeExpList(root).filter((e) => !e.open);
  const start = mechanical("start", "start");
  start.edges.push({ to: "end", role: "normal" });
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];
  const centerY = closed.length === 0 ? 80 : ((closed.length - 1) * 420) / 2 + 80;
  nodes.push({ id: "n-start", type: "file", file: "start.md", x: -1400, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });
  nodes.push({ id: "n-end", type: "file", file: "end.md", x: 260, y: centerY, width: 160, height: 160, styleAttributes: { shape: "pill" } });
  edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  closed.forEach((e, i) => {
    const sid = shortId(e.id);
    const fm = readRecord(root, e);
    const goal = typeof fm?.goal === "string" ? fm.goal : "";
    expByState[sid] = e.id;
    states.push({
      id: sid,
      kind: "work",
      statement: goal !== "" ? goal : e.id,
      guidance: "An archived expedition — read-only. Its record and report are in the details; the walk never enters here.",
      evidence_form: [],
      priority: 0.2,
      tags: ["archive-record"],
      edges: [{ to: "end", role: "alternative" }],
    });
    const y = i * 420;
    nodes.push({ id: `n-${sid}`, type: "file", file: `${sid}.md`, x: -1100, y, width: 620, height: 360 });
    edges.push({ id: `e-${sid}-end`, fromNode: `n-${sid}`, toNode: "n-end" });
  });
  states.push(mechanical("end", "end"));
  const decl: MachineDecl = { id: "expedition_archive", reentry: "restart", initial: "start", states };
  validateMachine(decl);
  const canvas: CanvasData = {
    nodes: nodes as CanvasElement[],
    edges,
    metadata: { frontmatter: { reentry: "restart", priority: 0.2 } },
  };
  return { decl, canvas, expByState };
}
