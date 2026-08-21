// see dsp-narration.md#the-decision-graph
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

export interface DecisionNode {
  id: string;
  visit: string;
  parent: string | null;
  brief: string;
  status: "open" | "done" | "obsolete" | "reverted" | "deferred";
  /** Where the point came from — the state's to-do list names it. */
  origin?: "planned" | "fork" | "deferred";
  /** How many defers carried this point here, and through which states. */
  hops?: number;
  trail?: string[];
  at: string;
  closed_at?: string;
  resolution?: string;
}

export interface DecisionOp {
  op: "plan" | "fork" | "done" | "obsolete" | "revert" | "update" | "defer";
  brief?: string;
  items?: string[];
  /** Announce-only: what the parser corrected. Stripped before apply, never persisted. */
  corrected?: string;
  node?: string;
  /** defer only: the state id that can do the point — it arrives there. */
  to?: string;
}

const CLOSES: Record<string, DecisionNode["status"]> = {
  done: "done",
  obsolete: "obsolete",
  revert: "reverted",
};

const SHAPE_NOTE =
  'ops: plan {items: ["..."]} starts the checklist (node = optional parent) · ' +
  "fork {brief, items?} opens an unplanned branch where you are · " +
  "done|obsolete|revert {node, brief?} resolves a node (brief = resolution) · " +
  "update {brief, node?} says what you are doing · " +
  "defer {node, to: <state>} parks a point for the state that can do it — it arrives there as an open to-do";

/** REPLAY (owner ruling 2026-07-27): the jsonl re-arms what an engine
 *  life left standing — parked defers that never arrived, and points
 *  still open. Sequential; a re-minted node id shadows its ancestor (the
 *  per-part history stays in the file for the retro). */
type ReplayLiveNode = { visit: string; brief: string; open: boolean };
type ReplayParked = { state: string; brief: string; hops?: number; trail?: string[] };

function replayFileOp(nodes: Map<string, ReplayLiveNode>, parked: ReplayParked[], rec: Record<string, unknown>): void {
  const op = String(rec.op ?? "");
  if (op === "plan" || op === "fork") {
    const list = Array.isArray(rec.nodes) ? (rec.nodes as { id: string; brief: string }[]) : [];
    for (const n of list) nodes.set(n.id, { visit: String(rec.visit ?? ""), brief: n.brief, open: true });
    if (op === "fork" && rec.node !== undefined)
      nodes.set(String(rec.node), { visit: String(rec.visit ?? ""), brief: String(rec.brief ?? ""), open: true });
    return;
  }
  if (op === "done" || op === "obsolete" || op === "revert") {
    const n = nodes.get(String(rec.node ?? ""));
    if (n) n.open = false;
    return;
  }
  replayDeferOps(nodes, parked, op, rec);
}

function replayDeferOps(nodes: Map<string, ReplayLiveNode>, parked: ReplayParked[], op: string, rec: Record<string, unknown>): void {
  if (op === "defer") {
    const n = nodes.get(String(rec.node ?? ""));
    if (n) n.open = false;
    parked.push({
      state: String(rec.to ?? ""),
      brief: String(rec.brief ?? ""),
      hops: Number(rec.hops ?? 1),
      trail: Array.isArray(rec.trail) ? rec.trail.map(String) : undefined,
    });
    return;
  }
  if (op === "defer_arrived") {
    const brief = String(rec.brief ?? "");
    const state = String(rec.visit ?? "").split("@")[0];
    const i = parked.findIndex((p) => p.state === state && p.brief === brief);
    if (i >= 0) parked.splice(i, 1);
    if (rec.node !== undefined) nodes.set(String(rec.node), { visit: String(rec.visit ?? ""), brief, open: true });
  }
}

export function replayFile(path: string): {
  parked: ReplayParked[];
  open: { id: string; visit: string; brief: string }[];
} {
  if (!existsSync(path)) return { parked: [], open: [] };
  const nodes = new Map<string, ReplayLiveNode>();
  const parked: ReplayParked[] = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    let rec: Record<string, unknown>;
    try {
      rec = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    replayFileOp(nodes, parked, rec);
  }
  return { parked, open: [...nodes.entries()].filter(([, n]) => n.open).map(([id, n]) => ({ id, visit: n.visit, brief: n.brief })) };
}

/** Full per-visit replay for RENDERING a record's decision history — the
 *  archive shows each visit's tree, statuses included. */
export interface ReplayNode {
  id: string;
  parent: string | null;
  brief: string;
  status: string;
  at?: string;
  closed_at?: string;
  resolution?: string;
}

interface ReplayCtx {
  byVisit: Map<string, Map<string, ReplayNode>>;
  home: Map<string, string>;
  updateSeq: number;
}

function replayTouch(ctx: ReplayCtx, visit: string): Map<string, ReplayNode> {
  let m = ctx.byVisit.get(visit);
  if (!m) {
    m = new Map();
    ctx.byVisit.set(visit, m);
  }
  return m;
}

function replaySetStatus(ctx: ReplayCtx, id: string, status: string, closedAt?: string, resolution?: string): void {
  const v = ctx.home.get(id);
  if (v === undefined) return;
  const n = ctx.byVisit.get(v)?.get(id);
  if (!n) return;
  n.status = status;
  if (closedAt !== undefined) n.closed_at = closedAt;
  if (resolution !== undefined && resolution !== "") n.resolution = resolution;
}

function replayPlanFork(ctx: ReplayCtx, rec: Record<string, unknown>, op: string, visit: string, ts: string | undefined): void {
  const parent = rec.parent === undefined || rec.parent === null ? null : String(rec.parent);
  if (op === "fork" && rec.node !== undefined) {
    replayTouch(ctx, visit).set(String(rec.node), { id: String(rec.node), parent, brief: String(rec.brief ?? ""), status: "open", at: ts });
    ctx.home.set(String(rec.node), visit);
  }
  const under = op === "fork" && rec.node !== undefined ? String(rec.node) : parent;
  for (const n of Array.isArray(rec.nodes) ? (rec.nodes as { id: string; brief: string }[]) : []) {
    replayTouch(ctx, visit).set(n.id, { id: n.id, parent: under, brief: n.brief, status: "open", at: ts });
    ctx.home.set(n.id, visit);
  }
}

// AN UPDATE REPORTS ON A NODE. It never closes one, and it never
// replaces one. Overwriting the target here marked every touched item
// done and dropped its parent, so a replayed visit showed finished
// work that was still open and a flat list where nesting stood.
//
// AN UPDATE LANDS AS A CHECKED POINT UNDER ITS NODE (walking.md). It
// is a child, with an id of its own. Writing it AT the target's id
// overwrote the target, which marked open work done and flattened the
// nesting; dropping it instead lost the trail. Neither is the point.
// A target this log never opened belongs to another engine life — the
// id counter restarts on a reload, so d74 in one visit is not d74 in
// the next. Hang the update on the trunk rather than invent a point
// that was never planned.
function replayUpdate(ctx: ReplayCtx, rec: Record<string, unknown>, visit: string, ts: string | undefined): void {
  const id = String(rec.node ?? "");
  if (id === "") return;
  const owner = ctx.home.get(id) ?? visit;
  const parent = ctx.byVisit.get(owner)?.get(id) === undefined ? null : id;
  const childId = `${id}.${++ctx.updateSeq}`;
  replayTouch(ctx, owner).set(childId, { id: childId, parent, brief: String(rec.brief ?? ""), status: "done", at: ts, closed_at: ts });
  ctx.home.set(childId, owner);
}

function replayOne(ctx: ReplayCtx, rec: Record<string, unknown>): void {
  const op = String(rec.op ?? "");
  const visit = String(rec.visit ?? "");
  const ts = rec.ts === undefined ? undefined : String(rec.ts);
  if (op === "plan" || op === "fork") {
    replayPlanFork(ctx, rec, op, visit, ts);
  } else if (op === "done" || op === "obsolete" || op === "revert") {
    replaySetStatus(ctx, String(rec.node ?? ""), op === "revert" ? "reverted" : op, ts, String(rec.brief ?? ""));
  } else if (op === "update") {
    replayUpdate(ctx, rec, visit, ts);
  } else if (op === "defer") {
    replaySetStatus(ctx, String(rec.node ?? ""), "deferred", ts, `deferred to ${String(rec.to ?? "?")}`);
  } else if (op === "defer_arrived") {
    const id = String(rec.node ?? "");
    replayTouch(ctx, visit).set(id, { id, parent: null, brief: String(rec.brief ?? ""), status: "open", at: ts });
    ctx.home.set(id, visit);
  }
}

export function replayVisitsText(text: string): { visit: string; nodes: ReplayNode[] }[] {
  const ctx: ReplayCtx = { byVisit: new Map(), home: new Map(), updateSeq: 0 };
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    let rec: Record<string, unknown>;
    try {
      rec = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    replayOne(ctx, rec);
  }
  return [...ctx.byVisit.entries()].map(([visit, m]) => ({ visit, nodes: [...m.values()] }));
}

function malformed(got: string): Rejection {
  return new Rejection({
    clause: CLAUSES.UPDATE_MALFORMED,
    expected: "an update op: {op: plan|fork|done|obsolete|revert|update, brief?, items?, node?}",
    got,
    remedy: { tool: "(the same call)", args: { update: { op: "update", brief: "<one line: what you are doing>" } }, note: SHAPE_NOTE },
    source: "engine/decisions.ts parse",
  });
}

/** Harnesses without the update property in their loaded schema serialize
 *  it as a JSON string — accept both forms (v2 field lesson, toll.ts). */
export function parseUpdate(v: unknown): DecisionOp {
  const u = updateShapeOf(v);
  const { op, items, brief, node, to } = updateFieldsOf(u);
  const { opOut, briefOut, itemsOut, corrected } = correctChains(op, brief, items);
  if (briefOut !== undefined) lintUpdateLine(briefOut, "brief");
  // WHICH item, not just "an item". A five-item plan refused on "item" left
  // the caller re-reading all five to find the one that tripped.
  (itemsOut ?? []).forEach((it, i) => {
    lintUpdateLine(it, `item ${i + 1}`);
  });
  return {
    op: opOut,
    ...(briefOut !== undefined ? { brief: briefOut } : {}),
    ...(itemsOut !== undefined ? { items: itemsOut } : {}),
    ...(node !== undefined ? { node } : {}),
    ...(to !== undefined ? { to } : {}),
    ...(corrected !== undefined ? { corrected } : {}),
  };
}

function updateShapeOf(v: unknown): Record<string, unknown> {
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      throw malformed("a string that is not JSON");
    }
  }
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw malformed(typeof v);
  return v as Record<string, unknown>;
}

function updateFieldsOf(u: Record<string, unknown>): {
  op: string;
  items: string[] | undefined;
  brief: string | undefined;
  node: string | undefined;
  to: string | undefined;
} {
  const op = String(u.op ?? "");
  if (!(op in CLOSES) && op !== "plan" && op !== "fork" && op !== "update" && op !== "defer")
    throw malformed(`op: ${JSON.stringify(u.op)}`);
  const items = u.items === undefined ? undefined : Array.isArray(u.items) ? u.items.map(String).filter((s) => s.trim() !== "") : null;
  if (items === null) throw malformed("items is not an array of strings");
  const brief = u.brief === undefined ? undefined : String(u.brief);
  const node = u.node === undefined ? undefined : String(u.node);
  const to = u.to === undefined ? undefined : String(u.to);
  if (op === "defer" && (node === undefined || to === undefined || to.trim() === ""))
    throw malformed("defer needs node and to (the state that can do it)");
  if (op === "plan" && (items === undefined || items.length === 0)) throw malformed("plan without items");
  if (op === "fork" && (brief === undefined || brief.trim() === "")) throw malformed("fork without brief");
  if (op in CLOSES && node === undefined) throw malformed(`${op} without node`);
  if (op === "update" && (brief === undefined || brief.trim() === "")) throw malformed("update without brief");
  return { op, items, brief, node, to };
}

function chainOf(text: string): string[] | null {
  const raw = text.split(/[,;]/);
  if (raw.length < 3) return null;
  const parts = raw.map((p) => p.trim()).filter((p) => p !== "");
  return parts.length >= 2 ? parts : null;
}

// see dsp-narration.md#the-chain-is-corrected
function correctChains(
  op: string,
  brief: string | undefined,
  items: string[] | undefined,
): { opOut: DecisionOp["op"]; briefOut: string | undefined; itemsOut: string[] | undefined; corrected: string | undefined } {
  let opOut = op as DecisionOp["op"];
  let briefOut = brief;
  let itemsOut = items;
  let corrected: string | undefined;
  if (opOut === "update" && briefOut !== undefined) {
    const parts = chainOf(briefOut);
    if (parts !== null) {
      opOut = "plan";
      itemsOut = parts;
      briefOut = undefined;
      corrected = `narration landed as a plan — a chain is a list, and its parts are the items: [${parts.map((p) => JSON.stringify(p)).join(", ")}]`;
    }
  }
  // A FORK'S CHAINED BRIEF IS CORRECTED TOO, and for the same reason an
  // update's is: the split is already computed, and throwing it away to
  // refuse costs a round trip for a comma.
  //
  // IT STAYS A FORK. A fork is a blocking detour and an update is not, so
  // turning one into a plan would change what the call MEANS. Only the shape
  // is corrected: the parts become the detour's items, and its first part
  // names it — which is what "fix A, then B, then C" says.
  if (opOut === "fork" && briefOut !== undefined) {
    const parts = chainOf(briefOut);
    if (parts !== null) {
      itemsOut = [...parts, ...(itemsOut ?? [])];
      briefOut = parts[0];
      corrected = `the fork kept its shape and its chain became its items — named by its first part: [${parts.map((p) => JSON.stringify(p)).join(", ")}]`;
    }
  }
  if (itemsOut?.some((it) => chainOf(it) !== null)) {
    itemsOut = itemsOut.flatMap((it) => chainOf(it) ?? [it]);
    corrected = corrected ?? "a chained item was split into the items it listed";
  }
  return { opOut, briefOut, itemsOut, corrected };
}

/** THE SAME BRIEF, CUT AT A WORD BOUNDARY SO IT FITS.
 *
 *  "101 chars, the cap is 90" is accurate and leaves the reader to compose a
 *  second sentence for a line nobody will read twice.
 *
 *  MEASURED ON THE i15 WALK: ten refusals for length, every one between 91 and
 *  112 characters. Not one was a rambling brief — each was an ordinary sentence
 *  a handful of characters over, and each cost a round trip plus whatever the
 *  model spent rewording it.
 *
 *  SO THE ANSWER HANDS BACK A VERSION THAT FITS. The author still chooses:
 *  nothing is written, and a cut sentence is a suggestion, not a correction.
 *  What it removes is the re-composition, not the judgment. */
export function cutToFit(text: string, cap = 90): string {
  if (text.length <= cap) return text;
  const room = cap - 1; // the ellipsis takes one
  const space = text.lastIndexOf(" ", room);
  // A SINGLE UNBROKEN RUN HAS NO WORD BOUNDARY TO CUT AT — a path, a hash, a
  // long identifier. Cutting mid-token beats returning something over the cap.
  return `${text.slice(0, space > cap / 2 ? space : room).trimEnd()}…`;
}

// THE RENDER LINT (owner ruling 2026-07-27): the lane refuses what would
// render weird — mechanically, at the boundary.
function lintUpdateLine(text: string, what: string): void {
  if (/[\r\n]/.test(text)) throw malformed(`${what} carries line breaks — one line only. Got ${JSON.stringify(text)}`);
  if (text.length > 90)
    throw malformed(
      `${what} is ${text.length} chars — the feed renders 90; tighten it. Got ${JSON.stringify(text)} — cut to fit: ${JSON.stringify(cutToFit(text))}`,
    );
  const parts = chainOf(text);
  if (parts !== null) {
    throw malformed(
      `${what} chains ${parts.length} separator-joined parts — an unrendered list. Got ${JSON.stringify(text)} — as a plan that is items: [${parts.map((p) => JSON.stringify(p)).join(", ")}]`,
    );
  }
}

export class Decisions {
  readonly path: string;
  private readonly nodes = new Map<string, DecisionNode>();
  private activeId?: string;
  private seq = 0;

  constructor(seDirPath: string) {
    this.path = join(seDirPath, "decisions.jsonl");
    // Parked defers from earlier engine lives re-arm — a reload never
    // loses a moved point (session file only; it stays out of git).
    this.parked.push(...replayFile(this.path).parked);
  }

  /** A second sink while a persistent record is bound: the reasoning is part
   *  of the record, reviewable after the fact, parts per visit. */
  private extraPath?: string;

  setExtraSink(path?: string): void {
    this.extraPath = path;
  }

  private record(line: Record<string, unknown>): void {
    const row = `${JSON.stringify({ ts: new Date().toISOString(), ...line })}\n`;
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, row, "utf8");
    if (this.extraPath !== undefined) {
      mkdirSync(dirname(this.extraPath), { recursive: true });
      appendFileSync(this.extraPath, row, "utf8");
    }
  }

  private add(visit: string, parent: string | null, brief: string, origin?: DecisionNode["origin"]): DecisionNode {
    const node: DecisionNode = {
      id: `d${++this.seq}`,
      visit,
      parent,
      brief,
      status: "open",
      at: new Date().toISOString(),
      ...(origin !== undefined ? { origin } : {}),
    };
    this.nodes.set(node.id, node);
    return node;
  }

  /** The open node ids, oldest first. The TOLL asks for these so its refusal
   *  can name a real one instead of a placeholder — a remedy that costs a
   *  second call to make executable is not executable. */
  openNodeIds(): string[] {
    return [...this.nodes.values()].filter((n) => n.status === "open").map((n) => n.id);
  }

  /** The remedy's map: what is still open, so a wrong ref heals in one turn. */
  private openBriefs(): string {
    const open = [...this.nodes.values()].filter((n) => n.status === "open");
    if (open.length === 0) return "(none open — plan or fork first)";
    const shown = open
      .slice(-8)
      .map((n) => `${n.id}: ${n.brief}`)
      .join(" · ");
    return open.length > 8 ? `${shown} · …and ${open.length - 8} more` : shown;
  }

  private openNode(id: string): DecisionNode {
    const n = this.nodes.get(id);
    if (n === undefined || n.status !== "open") {
      throw new Rejection({
        clause: CLAUSES.DECISION_NODE,
        expected: `an OPEN decision node — ${this.openBriefs()}`,
        got: n === undefined ? `unknown node: ${id}` : `${id} is already ${n.status}`,
        remedy: { tool: "(the same call)", args: { update: { op: "update", node: "<an open node id>", brief: "..." } }, note: SHAPE_NOTE },
        source: "engine/decisions.ts node",
      });
    }
    return n;
  }

  private openChildren(id: string): DecisionNode[] {
    return [...this.nodes.values()].filter((n) => n.parent === id && n.status === "open");
  }

  private close(n: DecisionNode, status: DecisionNode["status"], resolution: string | undefined): void {
    n.status = status;
    n.closed_at = new Date().toISOString();
    if (resolution !== undefined) n.resolution = resolution;
    // obsolete/revert sweep their open descendants — a dropped branch drops
    // whole, VISIBLY. done never cascades (children resolve first).
    if (status !== "done") for (const c of this.openChildren(n.id)) this.close(c, status, `swept with ${n.id}`);
  }

  /** Nearest open ancestor — where the hand lands after closing a branch. */
  private openAncestor(n: DecisionNode): string | undefined {
    let p = n.parent;
    while (p !== null) {
      const a = this.nodes.get(p);
      if (a === undefined) return undefined;
      if (a.status === "open") return a.id;
      p = a.parent;
    }
    return undefined;
  }

  /** Deferred points arrive when their state's visit is first touched —
   *  a prefilled to-do, open like any planned item. */
  private materialize(visit: string): void {
    const state = visit.split("@")[0];
    const due = this.parked.filter((p) => p.state === state);
    if (due.length === 0) return;
    const keep = this.parked.filter((p) => p.state !== state);
    this.parked.splice(0, this.parked.length, ...keep);
    for (const p of due) {
      const n = this.add(visit, null, p.brief, "deferred");
      n.hops = p.hops ?? 1;
      n.trail = p.trail ?? [state];
      this.record({ op: "defer_arrived", visit, node: n.id, brief: n.brief, hops: n.hops, trail: n.trail });
    }
  }

  private readonly parked: { state: string; brief: string; hops?: number; trail?: string[] }[] = [];
  /** see dsp-narration.md#updates-landed-since-anything-last-closed */
  private sinceResolve = 0;
  /** WARN HERE. The nudge rides the result and costs nothing. */
  private static readonly NUDGE_AFTER = 5;
  /** REFUSE HERE, and the gap between the two IS the grace.
   *
   *  BOTH USED TO BE 5, so the warning and the refusal arrived one call apart:
   *  the fifth update was nudged and the sixth was refused. A rule that warns
   *  and then bites immediately is not a warning, it is a two-stage refusal.
   *
   *  WHY THAT IS WRONG HERE. The counter measures updates since anything
   *  CLOSED, and a chunk of real work legitimately runs longer than six calls
   *  without finishing an item — reading four files to find a root cause
   *  closes nothing and is not a stall. Seven refusals on this iteration's own
   *  walk, every one during work that was moving.
   *
   *  THE TEETH STAY. Twelve updates with nothing closed is a genuinely stalled
   *  checklist, and the remedy is still one call away and never refused. */
  private static readonly REFUSE_AFTER = 12;
  /** What attachTo corrected on THIS call — read once by apply(). */
  private lastCorrection: string | undefined;

  /** DOES A STATE BY THIS NAME EXIST? Set by the session, which is the only
   *  thing that knows.
   *
   *  A DEFER NAMES THE STATE THAT CAN DO THE POINT, and nothing checked the
   *  name. A to-do parked for a state nobody drew is delivered when the walk
   *  reaches it, which is never, and it reads exactly like a to-do that is
   *  waiting its turn. Five places in one record sent work to a `gate-design`
   *  that has never been drawn, and the most expensive of them meant ten musts
   *  were never held against four candidates.
   *
   *  IT MARKS AND NEVER REFUSES. Narration must not become somewhere a walk can
   *  get stuck, and the mark rides the same `corrected` line every other
   *  narration correction uses. */
  stateExists?: (id: string) => boolean;
  /** WHICH ITEMS WERE ALREADY OPEN THE LAST TIME THIS GUARD BIT.
   *
   *  The guard names what is open, which is true and was not enough. An item
   *  open across two separate refusals is not an item somebody has not got to
   *  yet — it is an item that CANNOT close from where the walk stands, and no
   *  amount of resolving ops will move it.
   *
   *  MEASURED ON THE i15 WALK: 59 refusals, every one of them SE-C-133, every
   *  one carrying the same two items — "walk boot reading loop", still open
   *  hours after boot ended, and "work milestones as served", which cannot
   *  close until the iteration does. The work was real and the narration was
   *  honest. The checklist was the wrong shape, and the answer never said so.
   *
   *  NO CLOCK IS NEEDED TO KNOW IT. Surviving one refusal is what makes an
   *  item suspect; surviving two is what makes it wrong. */
  private namedInLastStall = new Set<string>();

  /** see dsp-narration.md#the-nudge-grew-teeth */
  private refuseIfStalled(u: DecisionOp): void {
    if (u.op === "done" || u.op === "obsolete" || u.op === "revert" || u.op === "defer") return;
    if (this.sinceResolve < Decisions.REFUSE_AFTER) return;
    const openNodes = [...this.nodes.values()].filter((n) => n.status === "open").map((n) => ({ id: n.id, brief: n.brief }));
    if (openNodes.length === 0) return;
    // AN ITEM THAT SURVIVED THE LAST REFUSAL IS THE WRONG SHAPE, not an item
    // nobody got to. Naming it as merely open sends the reader looking for
    // work to finish, and there is none to find — see namedInLastStall.
    const stuck = openNodes.filter((n) => this.namedInLastStall.has(n.id));
    this.namedInLastStall = new Set(openNodes.map((n) => n.id));
    const shape =
      stuck.length === 0
        ? ""
        : ` THESE WERE ALREADY OPEN AT THE LAST REFUSAL: ${stuck
            .map((n) => `${n.id} (${n.brief})`)
            .join(
              " · ",
            )}. An item that cannot close where you stand is not an item — it is the state you are in. Resolve it with obsolete, then send a fresh plan whose items will close in THIS state.`;
    throw new Rejection({
      clause: CLAUSES.NARRATION_STALLED,
      expected: "a resolving op — done, obsolete, revert or defer — because the checklist has not moved",
      got: `${this.sinceResolve} updates since anything closed, with ${openNodes.length} still open`,
      remedy: {
        tool: "(the same call)",
        args: { update: { op: "done", node: openNodes[0].id, brief: "<what landed>" } },
        note: `open now: ${openNodes.map((n) => `${n.id} (${n.brief})`).join(" · ")}. Nothing finished? defer {node, to} parks it, obsolete {node, brief} drops it. One of these, then carry on.${shape}`,
      },
      source: "engine/decisions.ts stall",
    });
  }

  apply(visit: string, u: DecisionOp): Record<string, unknown> {
    this.materialize(visit);
    // BEFORE anything mutates. Every refusal's remedy says to repeat the call,
    // so the repeat must find the graph exactly as this call found it.
    this.refuseIfStalled(u);
    this.lastCorrection = undefined;
    switch (u.op) {
      case "plan":
        this.applyPlan(visit, u);
        break;
      case "fork":
        this.applyFork(visit, u);
        break;
      case "done":
      case "obsolete":
      case "revert":
        this.applyResolve(u);
        break;
      case "defer":
        this.applyDefer(u);
        break;
      case "update":
        this.applyUpdate(visit, u);
        break;
    }
    if (u.op === "update") this.sinceResolve++;
    else if (u.op === "done" || u.op === "obsolete" || u.op === "revert" || u.op === "defer") this.sinceResolve = 0;
    // THE MAP RIDES EVERY UPDATE (note-792c32b5425e item 5). Resolving a
    // node needs its id, and the id was only ever printed by a REFUSAL. So
    // the way to see the checklist was to name a node that does not exist
    // and read the rejection - done four times in e22 alone. The answer
    // carries the map, so the next call can be right.
    const openNodes = [...this.nodes.values()].filter((n) => n.status === "open").map((n) => ({ id: n.id, brief: n.brief }));
    const open = openNodes.length;
    // A NUDGE, never a refusal. Narration that outruns the checklist is bad
    // rhythm, not a broken call, and refusing the work over its commentary
    // is the mistake the update field already learned once.
    const nudge =
      this.sinceResolve >= Decisions.NUDGE_AFTER && open > 0
        ? `${this.sinceResolve} updates since anything closed, with ${open} still open — the checklist is a PROGRESS view. Close what is genuinely done on the NEXT call, not at the end.`
        : undefined;
    return {
      update: u.op,
      active: this.activeId ?? null,
      open,
      open_nodes: openNodes,
      ...(nudge !== undefined ? { nudge } : {}),
      ...(this.lastCorrection !== undefined ? { corrected: this.lastCorrection } : {}),
    };
  }

  private applyPlan(visit: string, u: DecisionOp): void {
    const parent = u.node === undefined ? null : this.openNode(u.node).id;
    // IDEMPOTENT. The update rides BEFORE the call's verdict (tools.ts),
    // and every refusal's remedy says to repeat the call — so a
    // refused-then-retried plan arrives again. An item already standing
    // open under this parent in this visit IS that item, not a second one.
    const standing = (b: string) =>
      [...this.nodes.values()].some((n) => n.visit === visit && n.parent === parent && n.brief === b && n.status === "open");
    const added = (u.items ?? []).filter((b) => !standing(b)).map((b) => this.add(visit, parent, b, "planned"));
    if (this.activeId === undefined) this.activeId = added[0]?.id;
    this.record({ op: "plan", visit, parent, nodes: added.map((n) => ({ id: n.id, brief: n.brief })) });
  }

  private applyFork(visit: string, u: DecisionOp): void {
    const parent =
      u.node !== undefined
        ? this.openNode(u.node).id
        : this.activeId !== undefined && this.nodes.get(this.activeId)?.status === "open"
          ? this.activeId
          : null;
    // Idempotent for the same reason a plan is — a retried call must not
    // open the same branch twice; it re-enters the one already standing.
    const standingFork = [...this.nodes.values()].find(
      (n) => n.visit === visit && n.parent === parent && n.brief === u.brief && n.status === "open" && n.origin === "fork",
    );
    if (standingFork !== undefined) {
      this.activeId = standingFork.id;
      return;
    }
    const fork = this.add(visit, parent, u.brief!, "fork");
    const added = (u.items ?? []).map((b) => this.add(visit, fork.id, b, "planned"));
    this.activeId = fork.id;
    this.record({
      op: "fork",
      visit,
      parent,
      node: fork.id,
      brief: fork.brief,
      nodes: added.map((n) => ({ id: n.id, brief: n.brief })),
    });
  }

  private applyResolve(u: DecisionOp): void {
    // IDEMPOTENT, for the reason plan and fork already are: the update
    // rides BEFORE the call's verdict, and every refusal's remedy says to
    // repeat the call. So a call refused for some UNRELATED reason comes
    // back with its resolution already applied, and the retry used to be
    // refused for a second, more confusing reason. Re-resolving a node the
    // SAME way is the state we were asked for; only a CONFLICTING
    // re-resolution is a real disagreement worth refusing.
    const op = u.op as "done" | "obsolete" | "revert";
    const already = this.nodes.get(u.node!);
    if (already !== undefined && already.status === CLOSES[op]) return;
    // see dsp-narration.md#a-node-from-an-earlier-sessions-visit
    if (already === undefined && this.extraPath !== undefined && this.resolveInRecord(op, u)) return;
    const n = this.openNode(u.node!);
    if (op === "done") {
      const open = this.openChildren(n.id);
      if (open.length > 0) {
        throw new Rejection({
          clause: CLAUSES.DECISION_UNRESOLVED,
          expected: `every child of ${n.id} resolved before it closes — still open: ${open.map((c) => `${c.id}: ${c.brief}`).join(" · ")}`,
          got: `done on ${n.id} over ${open.length} open child(ren)`,
          remedy: {
            tool: "(the same call)",
            args: { update: { op: "done", node: open[0].id, brief: "<how it resolved>" } },
            note: "resolve each child (done, or obsolete/revert if it did not survive), then close the parent",
          },
          source: "engine/decisions.ts resolve",
        });
      }
    }
    this.close(n, CLOSES[op], u.brief);
    if (this.activeId !== undefined && this.nodes.get(this.activeId)?.status !== "open") this.activeId = this.openAncestor(n);
    this.record({ op, visit: n.visit, node: n.id, ...(u.brief !== undefined ? { brief: u.brief } : {}) });
  }

  /** True when the node lives only in the durable record — resolved there. */
  private resolveInRecord(op: "done" | "obsolete" | "revert", u: DecisionOp): boolean {
    let visits: { visit: string; nodes: ReplayNode[] }[] = [];
    try {
      visits = replayVisitsText(readFileSync(this.extraPath!, "utf8"));
    } catch {
      /* no record yet — the ordinary refusal below says so */
    }
    const known = visits.find((v) => v.nodes.some((x) => x.id === u.node));
    if (known === undefined) return false;
    const past = known.nodes.find((x) => x.id === u.node)!;
    if (past.status !== "open") return true; // settled already — a repeat is a no-op across sessions too
    this.record({ op, visit: known.visit, node: u.node, ...(u.brief !== undefined ? { brief: u.brief } : {}) });
    this.sinceResolve = 0;
    return true;
  }

  private applyDefer(u: DecisionOp): void {
    const n = this.openNode(u.node!);
    // THE CAP (owner ruling 2026-07-27): three defers, then the wall —
    // the fourth forces a decision. Every out stays legal and honest.
    const hops = (n.hops ?? 0) + 1;
    const trail = [...(n.trail ?? [n.visit.split("@")[0]]), u.to!];
    if (hops > 3) {
      throw new Rejection({
        clause: CLAUSES.DECISION_UNRESOLVED,
        expected: `a DECISION — this point was deferred 3 times already (${trail.join(" → ")}); do it, obsolete it with the reason, or seed it as real work`,
        got: `defer number ${hops}`,
        remedy: {
          tool: "(the same call)",
          args: { update: { op: "done", node: n.id, brief: "<how it resolved>" } },
          note: "chronic deferral is usually a seed in disguise — se_seed_iteration gives it a goal and a vision",
        },
        source: "engine/decisions.ts defer",
      });
    }
    if (this.openChildren(n.id).length > 0) {
      throw new Rejection({
        clause: CLAUSES.DECISION_UNRESOLVED,
        expected: "no open children under a deferred point — resolve or defer each first",
        got: `${n.id} still has open children`,
        remedy: { tool: "(the same call)", args: { update: { op: "defer", node: "<child id>", to: u.to } }, note: SHAPE_NOTE },
        source: "engine/decisions.ts defer",
      });
    }
    // THE PARK IS STILL MADE. A point deferred to a name nobody drew is better
    // recorded with the mark than refused into thin air, and the walker can
    // re-home it once the mark says so.
    if (this.stateExists?.(u.to!) === false) {
      this.lastCorrection = `no state is called ${u.to!} — this point is parked for something nobody has drawn, so nothing will ever deliver it`;
    }
    this.close(n, "deferred", `deferred to ${u.to}`);
    this.parked.push({ state: u.to!, brief: n.brief, hops, trail });
    if (this.activeId === n.id) this.activeId = this.openAncestor(n);
    this.record({ op: "defer", visit: n.visit, node: n.id, brief: n.brief, to: u.to, hops, trail });
  }

  private applyUpdate(visit: string, u: DecisionOp): void {
    // see dsp-narration.md#an-update-names-the-item-it-is-about
    if (u.node === undefined && [...this.nodes.values()].some((n) => n.visit === visit && n.status === "open")) {
      throw new Rejection({
        clause: CLAUSES.DECISION_NODE,
        expected: `update {node, brief} - which item is this about? ${this.openBriefs()}`,
        got: "an update naming no node, with a checklist standing open",
        remedy: {
          tool: "(the same call)",
          args: { update: { op: "update", node: "<an open node id>", brief: "..." } },
          note: "or resolve one instead - done | obsolete | revert. A fork opens a new branch where you are",
        },
        source: "engine/decisions.ts update",
      });
    }
    if (u.node !== undefined) this.activeId = this.attachTo(u.node);
    // EVERY update changes the RENDER (owner ruling 2026-07-27): the
    // brief lands as a checked point under the active node — the log
    // line and the tree always tell the same story, mechanically.
    const point = this.add(visit, this.activeId ?? null, u.brief ?? "");
    this.close(point, "done", undefined);
    this.record({ op: "update", visit, node: point.id, brief: u.brief });
  }

  /** see dsp-narration.md#the-node-an-update-attaches-to */
  private attachTo(id: string): string | undefined {
    const named = this.nodes.get(id);
    if (named?.status === "open") return named.id;
    const parent = named === undefined ? undefined : this.openAncestor(named);
    const landed = parent === undefined ? "bare" : `on its open parent ${parent}`;
    this.lastCorrection =
      named === undefined ? `no node ${id} — the update landed bare` : `${id} is already ${named.status} — the update landed ${landed}`;
    return parent;
  }

  /** One state visit's tree, insertion-ordered — the mirror renders this.
   *  Every update op IS in the tree (a checked point), so the log and the
   *  panel always tell the same story. */
  graph(visit: string): { visit: string; active: string | null; nodes: DecisionNode[] } {
    this.materialize(visit);
    const nodes = [...this.nodes.values()].filter((n) => n.visit === visit);
    const active = this.activeId !== undefined && this.nodes.get(this.activeId)?.visit === visit ? this.activeId : null;
    return { visit, active, nodes };
  }

  /** A state's decision history across its visits, plus points still
   *  parked for it — the details pane's to-do sections. READ-ONLY:
   *  looking never materializes a parked defer. */
  stateTodos(stateId: string): {
    visits: { visit: string; nodes: DecisionNode[] }[];
    parked: { brief: string; hops?: number; trail?: string[] }[];
  } {
    const byVisit = new Map<string, DecisionNode[]>();
    for (const n of this.nodes.values()) {
      if (n.visit !== stateId && !n.visit.startsWith(`${stateId}@`)) continue;
      const list = byVisit.get(n.visit) ?? [];
      list.push(n);
      byVisit.set(n.visit, list);
    }
    return {
      visits: [...byVisit.entries()].map(([visit, nodes]) => ({ visit, nodes })),
      parked: this.parked
        .filter((p) => p.state === stateId)
        .map((p) => ({
          brief: p.brief,
          ...(p.hops !== undefined ? { hops: p.hops } : {}),
          ...(p.trail !== undefined ? { trail: p.trail } : {}),
        })),
    };
  }

  /** Open nodes whose visit belongs to one of the given state ids — the
   *  evidence check: no point may stand open when the work claims done. */
  openFor(stateIds: string[]): DecisionNode[] {
    return [...this.nodes.values()].filter(
      (n) => n.status === "open" && stateIds.some((p) => n.visit === p || n.visit.startsWith(`${p}@`)),
    );
  }

  /** Every visit that recorded decisions, in first-seen order. */
  visits(): string[] {
    const seen: string[] = [];
    for (const n of this.nodes.values()) if (!seen.includes(n.visit)) seen.push(n.visit);
    return seen;
  }
}
