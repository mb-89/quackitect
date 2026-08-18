// see dsp-method-compilation.md#continueexpedition-is-generated-not-drawn
import { join } from "node:path";
import { type CanvasData, type CanvasEdge, type CanvasElement, nodeSize } from "./canvas.ts";
import { type MachineDecl, type StateDecl, validateMachine } from "./machine.ts";
import { stateFromNote } from "./machines/compile.ts";
import { readNode } from "./notes.ts";
import { type Expedition, expList, frontmatterOf, readRecord, recordRel } from "./records.ts";

export interface GeneratedMachine {
  decl: MachineDecl;
  canvas: CanvasData;
  /** state id (e5, e5-leave) → the full expedition id it belongs to. */
  expByState: Record<string, string>;
  /** Nested generated machines: state id → its generator (archive decades). */
  subGen?: Record<string, () => GeneratedMachine>;
}

export function shortId(expId: string): string {
  const m = expId.match(/^(e\d+)-/);
  return m ? m[1] : expId;
}

function mechanical(id: string, kind: "start" | "end"): StateDecl {
  return {
    id,
    kind,
    statement: "",
    guidance:
      kind === "start"
        ? "The seeded container: every open expedition stands as its own states. Pick ONE way forward — entering an expedition binds it."
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
  const notesDir = join(root, "project", "deliverable", "machines", "states");
  const workTpl = stateFromNote("expeditions", "states/work.md", join(notesDir, "work.md"), root);
  const leaveTpl = stateFromNote("expeditions", "states/leave.md", join(notesDir, "leave.md"), root);

  const start = mechanical("start", "start");
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];

  // THE ROW FOLLOWS THE BOXES, THE BOXES DO NOT FOLLOW THE ROW. These numbers
  // were hand-tuned for the struck 620x360 birth size, so a box that shrank to
  // its label left a group four times too wide around it.
  const ROW_STEP = 300; // group height plus the gap between two expeditions
  const GUTTER = 140; // between the work box and its leave box
  const PAD = 60; // group border to box
  const centerY = open.length === 0 ? 80 : ((open.length - 1) * ROW_STEP) / 2 + 50;
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
  const endNode: GenNode = {
    id: "n-end",
    type: "file",
    file: "end.md",
    x: 0,
    y: centerY,
    width: 160,
    height: 160,
    styleAttributes: { shape: "pill" },
  };
  nodes.push(endNode);
  let rightmost = -740;

  // LEAVING IS A DRAWN DOOR, AND IT COMES FIRST — the same correction the
  // iterations container took, for the same defect (i34, found by the tester at
  // verification). iterations.ts carries the full reasoning.
  //
  // THIS SIDE WAS WORSE. The exit was pushed ONLY when nothing stood open, so
  // with any expedition open `start` had no edge out that did not pass through
  // one — and a bare pull took the first authored edge, entering and BINDING an
  // expedition nobody picked.
  //
  // BOTH DOORS ARE `alternative` so the choice guard can see them. It holds the
  // walk still only above one alternative, so the exit has to count too, or a
  // single open expedition offers nothing and the walk leaves instead.
  start.edges.push({ to: "end", role: "alternative" });
  open.forEach((e, i) => {
    const sid = shortId(e.id);
    const fm = readRecord(root, e);
    // A record that will not parse still gets a node, saying so. Dropping it
    // would leave a hole where an expedition used to be.
    const goal = fm?.unreadable !== undefined ? `⚠ ${String(fm.unreadable)}` : String(fm?.goal ?? "");
    const workId = sid;
    const leaveId = `${sid}-leave`;
    expByState[workId] = e.id;
    expByState[leaveId] = e.id;
    states.push({ ...workTpl, id: workId, statement: goal !== "" ? goal : e.id, edges: [{ to: leaveId, role: "normal" }] });
    // ALTERNATIVE into end — normal edges would AND-join: end would wait
    // for EVERY expedition, and one coming home is the whole point.
    states.push({ ...leaveTpl, id: leaveId, statement: "", edges: [{ to: "end", role: "alternative" }] });
    start.edges.push({ to: workId, role: "alternative" });
    const y = i * ROW_STEP;
    const workBox = nodeSize(workId, goal);
    const leaveBox = nodeSize(leaveId);
    const workX = -740;
    const leaveX = workX + workBox.width + GUTTER;
    const right = leaveX + leaveBox.width;
    if (right > rightmost) rightmost = right;
    const rowH = Math.max(workBox.height, leaveBox.height);
    nodes.push({
      id: `g-${sid}`,
      type: "group",
      x: workX - PAD,
      y: y - PAD,
      width: right + PAD - (workX - PAD),
      height: rowH + PAD * 2,
      label: e.id,
    });
    nodes.push({ id: `n-${workId}`, type: "file", file: `${workId}.md`, x: workX, y, ...workBox });
    nodes.push({ id: `n-${leaveId}`, type: "file", file: `${leaveId}.md`, x: leaveX, y, ...leaveBox });
    edges.push({ id: `e-start-${workId}`, fromNode: "n-start", toNode: `n-${workId}` });
    edges.push({ id: `e-${workId}-${leaveId}`, fromNode: `n-${workId}`, toNode: `n-${leaveId}` });
    edges.push({ id: `e-${leaveId}-end`, fromNode: `n-${leaveId}`, toNode: "n-end" });
  });
  endNode.x = rightmost + 260;
  // The exit is drawn in every case now, because it EXISTS in every case.
  edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  states.push(mechanical("end", "end"));

  const decl: MachineDecl = { id: "expeditions", reentry: "restart", initial: "start", states };
  validateMachine(decl);
  const canvas: CanvasData = {
    nodes: nodes as CanvasElement[],
    edges,
    metadata: { frontmatter: { reentry: "restart", priority: 0.4 } },
  };
  return { decl, canvas, expByState };
}

/** see dsp-method-compilation.md#every-closed-expedition-stands-as-its-own-dead-machine */
function closedRecords(root: string, closed: Expedition[]): Map<string, Record<string, unknown> | undefined> {
  const out = new Map<string, Record<string, unknown> | undefined>();
  for (const e of closed) {
    // ONE ASK, THROUGH THE DOOR. This was existsSync then readFileSync — two
    // syscalls for one answer, 4,448 of the first to enter a record, and
    // neither of them shared with any other reader of the same file.
    //
    // EMPTY READS AS ABSENT, which is exact here: a record file always carries
    // frontmatter, so an empty one is a file that is not there.
    const text = readNode(join(root, recordRel(e.id)));
    out.set(e.id, text === "" ? undefined : frontmatterOf(text, `${e.id} record`));
  }
  return out;
}

/** One archive entry, whatever the record kind. */
export interface ArchiveEntry {
  sid: string;
  full: string;
  goal: string;
}

function recordState(e: ArchiveEntry, kindWord: string): StateDecl {
  return {
    id: e.sid,
    kind: "work",
    statement: e.goal !== "" ? e.goal : e.full,
    guidance: `An archived ${kindWord} — read-only. Its record and report are in the details.`,
    evidence_form: [],
    // Human-only (owner ruling 2026-07-27): 1.5 sits above the whole
    // slider — there is nothing for an agent to do in the archive, so no
    // autonomy ever admits it.
    priority: 1.5,
    tags: kindWord === "expedition" ? ["archive-record"] : [],
    edges: [{ to: "end", role: "alternative" }],
  };
}

function buildRecordColumn(machineId: string, entries: ArchiveEntry[], kindWord: string): GeneratedMachine {
  const start = mechanical("start", "start");
  const states: StateDecl[] = [start];
  const expByState: Record<string, string> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];
  const centerY = entries.length === 0 ? 80 : ((entries.length - 1) * 420) / 2 + 80;
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
    x: -240,
    y: centerY,
    width: 160,
    height: 160,
    styleAttributes: { shape: "pill" },
  });
  entries.forEach((e, i) => {
    expByState[e.sid] = e.full;
    const st = recordState(e, kindWord);
    states.push(st);
    start.edges.push({ to: e.sid, role: "normal" });
    const y = i * 420;
    // SIZED BY THE TEXT IT SHOWS. Measuring the id alone made every archive
    // box 200x72 while the drawing painted the goal underneath it.
    nodes.push({ id: `n-${e.sid}`, type: "file", file: `${e.sid}.md`, x: -1100, y, ...nodeSize(e.sid, st.statement) });
    edges.push({ id: `e-start-${e.sid}`, fromNode: "n-start", toNode: `n-${e.sid}` });
    edges.push({ id: `e-${e.sid}-end`, fromNode: `n-${e.sid}`, toNode: "n-end" });
  });
  if (entries.length === 0) {
    start.edges.push({ to: "end", role: "normal" });
    edges.push({ id: "e-start-end", fromNode: "n-start", toNode: "n-end" });
  }
  states.push(mechanical("end", "end"));
  const decl: MachineDecl = { id: machineId, reentry: "restart", initial: "start", states };
  validateMachine(decl);
  return {
    decl,
    canvas: { nodes: nodes as CanvasElement[], edges, metadata: { frontmatter: { reentry: "restart", priority: 0.2 } } },
    expByState,
  };
}

function buildDecades(machineId: string, entries: ArchiveEntry[], kindWord: string): GeneratedMachine {
  const start = mechanical("start", "start");
  const states: StateDecl[] = [start];
  const subGen: Record<string, () => GeneratedMachine> = {};
  type GenNode = CanvasElement & { styleAttributes?: Record<string, unknown> };
  const nodes: GenNode[] = [];
  const edges: CanvasEdge[] = [];
  // TOP TO BOTTOM (owner ruling 2026-07-28): decades stack vertically —
  // the reading direction for records is downward at every nesting level;
  // a new decade lands at the bottom.
  const decCount = Math.ceil(entries.length / 10);
  const centerY = ((decCount - 1) * 420) / 2 + 80;
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
    x: -240,
    y: centerY,
    width: 160,
    height: 160,
    styleAttributes: { shape: "pill" },
  });
  for (let d = 0; d < decCount; d++) {
    const slice = entries.slice(d * 10, d * 10 + 10);
    const decId = `${slice[0].sid}-${slice[slice.length - 1].sid}`;
    states.push({
      id: decId,
      kind: "work",
      statement: `${slice[0].sid} – ${slice[slice.length - 1].sid} (${slice.length} records)`,
      guidance: `A decade of archived ${kindWord}s — click into it; the records stand inside as their own states.`,
      evidence_form: [],
      priority: 1.5,
      tags: ["archive-decade"],
      submachine: "generated",
      edges: [{ to: "end", role: "alternative" }],
    });
    subGen[decId] = () => buildRecordColumn(decId, slice, kindWord);
    start.edges.push({ to: decId, role: "normal" });
    nodes.push({ id: `n-${decId}`, type: "file", file: `${decId}.md`, x: -1100, y: d * 420, ...nodeSize(decId) });
    edges.push({ id: `e-start-${decId}`, fromNode: "n-start", toNode: `n-${decId}` });
    edges.push({ id: `e-${decId}-end`, fromNode: `n-${decId}`, toNode: "n-end" });
  }
  states.push(mechanical("end", "end"));
  const decl: MachineDecl = { id: machineId, reentry: "restart", initial: "start", states };
  validateMachine(decl);
  return {
    decl,
    canvas: { nodes: nodes as CanvasElement[], edges, metadata: { frontmatter: { reentry: "restart", priority: 0.2 } } },
    expByState: {},
    subGen,
  };
}

/** see dsp-method-compilation.md#one-archive-shape-for-both-record-kinds */
export function buildArchive(machineId: string, entries: ArchiveEntry[], kindWord: string): GeneratedMachine {
  return entries.length > 10 ? buildDecades(machineId, entries, kindWord) : buildRecordColumn(machineId, entries, kindWord);
}

export function generateExpeditionArchive(root: string): GeneratedMachine {
  const closed = safeExpList(root).filter((e) => !e.open);
  const records = closedRecords(root, closed);
  const entries = closed.map((e) => {
    const fm = records.get(e.id);
    return { sid: shortId(e.id), full: e.id, goal: typeof fm?.goal === "string" ? fm.goal : "" };
  });
  return buildArchive("expedition_archive", entries, "expedition");
}
