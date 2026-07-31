// The decision graph — the agent's thought process as a per-state tree
// (owner design, first captured 2026-07-25 in v2's i9 notes; built here).
// Every task started is a NODE. Every node started gets RESOLVED: done,
// obsolete, or reverted — abandoning is legal, abandoning silently is not.
// Depth of forking IS the measure of drift; the retro reads the file.
//
// Ops arrive as the `update` field riding any lane call. The live graph is
// in-memory (session-scoped, like the walk); every op also appends to
// .se/decisions.jsonl — replayable, and the retro's raw material.
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
  "ops: plan {items: [\"...\"]} starts the checklist (node = optional parent) · " +
  "fork {brief, items?} opens an unplanned branch where you are · " +
  "done|obsolete|revert {node, brief?} resolves a node (brief = resolution) · " +
  "update {brief, node?} says what you are doing · " +
  "defer {node, to: <state>} parks a point for the state that can do it — it arrives there as an open to-do";

/** REPLAY (owner ruling 2026-07-27): the jsonl re-arms what an engine
 *  life left standing — parked defers that never arrived, and points
 *  still open. Sequential; a re-minted node id shadows its ancestor (the
 *  per-part history stays in the file for the retro). */
export function replayFile(path: string): { parked: { state: string; brief: string; hops?: number; trail?: string[] }[]; open: { id: string; visit: string; brief: string }[] } {
  if (!existsSync(path)) return { parked: [], open: [] };
  const nodes = new Map<string, { visit: string; brief: string; open: boolean }>();
  const parked: { state: string; brief: string; hops?: number; trail?: string[] }[] = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    let rec: Record<string, unknown>;
    try {
      rec = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const op = String(rec.op ?? "");
    if (op === "plan" || op === "fork") {
      const list = Array.isArray(rec.nodes) ? (rec.nodes as { id: string; brief: string }[]) : [];
      for (const n of list) nodes.set(n.id, { visit: String(rec.visit ?? ""), brief: n.brief, open: true });
      if (op === "fork" && rec.node !== undefined) nodes.set(String(rec.node), { visit: String(rec.visit ?? ""), brief: String(rec.brief ?? ""), open: true });
    } else if (op === "done" || op === "obsolete" || op === "revert") {
      const n = nodes.get(String(rec.node ?? ""));
      if (n) n.open = false;
    } else if (op === "defer") {
      const n = nodes.get(String(rec.node ?? ""));
      if (n) n.open = false;
      parked.push({ state: String(rec.to ?? ""), brief: String(rec.brief ?? ""), hops: Number(rec.hops ?? 1), trail: Array.isArray(rec.trail) ? rec.trail.map(String) : undefined });
    } else if (op === "defer_arrived") {
      const brief = String(rec.brief ?? "");
      const state = String(rec.visit ?? "").split("@")[0];
      const i = parked.findIndex((p) => p.state === state && p.brief === brief);
      if (i >= 0) parked.splice(i, 1);
      if (rec.node !== undefined) nodes.set(String(rec.node), { visit: String(rec.visit ?? ""), brief, open: true });
    }
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

export function replayVisitsText(text: string): { visit: string; nodes: ReplayNode[] }[] {
  const byVisit = new Map<string, Map<string, ReplayNode>>();
  const home = new Map<string, string>();
  const touch = (visit: string): Map<string, ReplayNode> => {
    let m = byVisit.get(visit);
    if (!m) {
      m = new Map();
      byVisit.set(visit, m);
    }
    return m;
  };
  const setStatus = (id: string, status: string, closedAt?: string, resolution?: string): void => {
    const v = home.get(id);
    if (v === undefined) return;
    const n = byVisit.get(v)?.get(id);
    if (!n) return;
    n.status = status;
    if (closedAt !== undefined) n.closed_at = closedAt;
    if (resolution !== undefined && resolution !== "") n.resolution = resolution;
  };
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    let rec: Record<string, unknown>;
    try {
      rec = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const op = String(rec.op ?? "");
    const visit = String(rec.visit ?? "");
    const ts = rec.ts === undefined ? undefined : String(rec.ts);
    if (op === "plan" || op === "fork") {
      const parent = rec.parent === undefined || rec.parent === null ? null : String(rec.parent);
      if (op === "fork" && rec.node !== undefined) {
        touch(visit).set(String(rec.node), { id: String(rec.node), parent, brief: String(rec.brief ?? ""), status: "open", at: ts });
        home.set(String(rec.node), visit);
      }
      const under = op === "fork" && rec.node !== undefined ? String(rec.node) : parent;
      for (const n of Array.isArray(rec.nodes) ? (rec.nodes as { id: string; brief: string }[]) : []) {
        touch(visit).set(n.id, { id: n.id, parent: under, brief: n.brief, status: "open", at: ts });
        home.set(n.id, visit);
      }
    } else if (op === "done" || op === "obsolete" || op === "revert") {
      setStatus(String(rec.node ?? ""), op === "revert" ? "reverted" : op, ts, String(rec.brief ?? ""));
    } else if (op === "update") {
      // AN UPDATE REPORTS ON A NODE. It never closes one, and it never
      // replaces one. Overwriting the target here marked every touched item
      // done and dropped its parent, so a replayed visit showed finished
      // work that was still open and a flat list where nesting stood.
      const id = String(rec.node ?? "");
      if (id === "") continue;
      const known = byVisit.get(home.get(id) ?? visit)?.get(id);
      if (known !== undefined) continue;
      // An update naming a node this log never opened still deserves a line,
      // because the point is real and lives in another visit.
      touch(visit).set(id, { id, parent: null, brief: String(rec.brief ?? ""), status: "done", at: ts, closed_at: ts });
      home.set(id, visit);
    } else if (op === "defer") {
      setStatus(String(rec.node ?? ""), "deferred", ts, `deferred to ${String(rec.to ?? "?")}`);
    } else if (op === "defer_arrived") {
      const id = String(rec.node ?? "");
      touch(visit).set(id, { id, parent: null, brief: String(rec.brief ?? ""), status: "open", at: ts });
      home.set(id, visit);
    }
  }
  return [...byVisit.entries()].map(([visit, m]) => ({ visit, nodes: [...m.values()] }));
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
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      throw malformed("a string that is not JSON");
    }
  }
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw malformed(typeof v);
  const u = v as Record<string, unknown>;
  const op = String(u.op ?? "");
  if (!(op in CLOSES) && op !== "plan" && op !== "fork" && op !== "update" && op !== "defer") throw malformed(`op: ${JSON.stringify(u.op)}`);
  const items = u.items === undefined ? undefined : Array.isArray(u.items) ? u.items.map(String).filter((s) => s.trim() !== "") : null;
  if (items === null) throw malformed("items is not an array of strings");
  const brief = u.brief === undefined ? undefined : String(u.brief);
  const node = u.node === undefined ? undefined : String(u.node);
  const to = u.to === undefined ? undefined : String(u.to);
  if (op === "defer" && (node === undefined || to === undefined || to.trim() === "")) throw malformed("defer needs node and to (the state that can do it)");
  if (op === "plan" && (items === undefined || items.length === 0)) throw malformed("plan without items");
  if (op === "fork" && (brief === undefined || brief.trim() === "")) throw malformed("fork without brief");
  if (op in CLOSES && node === undefined) throw malformed(`${op} without node`);
  if (op === "update" && (brief === undefined || brief.trim() === "")) throw malformed("update without brief");
  // THE RENDER LINT (owner ruling 2026-07-27): the lane refuses what would
  // render weird — mechanically, at the boundary.
  const lintLine = (text: string, what: string): void => {
    if (/[\r\n]/.test(text)) throw malformed(`${what} carries line breaks — one line only. Got ${JSON.stringify(text)}`);
    if (text.length > 90) throw malformed(`${what} is ${text.length} chars — the feed renders 90; tighten it. Got ${JSON.stringify(text)}`);
    // THE LANE'S MOST-HIT REFUSAL. Ten of thirteen update failures in one
    // day were this one, across two sessions. It refused correctly and named
    // neither the text nor the parts, so the caller guessed — and guessed
    // wrong often enough to hit it again on the very next call.
    //
    // The parts ARE the remedy, so they are written out. A chain that wanted
    // to be a list is handed back as that list.
    const raw = text.split(/[,;]/);
    if (raw.length >= 3) {
      const parts = raw.map((p) => p.trim()).filter((p) => p !== "");
      throw malformed(`${what} chains ${raw.length} separator-joined parts — an unrendered list. Got ${JSON.stringify(text)} — as a plan that is items: [${parts.map((p) => JSON.stringify(p)).join(", ")}]`);
    }
  };
  if (brief !== undefined) lintLine(brief, "brief");
  // WHICH item, not just "an item". A five-item plan refused on "item" left
  // the caller re-reading all five to find the one that tripped.
  (items ?? []).forEach((it, i) => lintLine(it, `item ${i + 1}`));
  return { op: op as DecisionOp["op"], ...(brief !== undefined ? { brief } : {}), ...(items !== undefined ? { items } : {}), ...(node !== undefined ? { node } : {}), ...(to !== undefined ? { to } : {}) };
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

  /** A second sink while a persistent record is bound (an expedition's
   *  worktree): the reasoning is part of the record, reviewable after the
   *  fact, parts per visit. */
  private extraPath?: string;

  setExtraSink(path?: string): void {
    this.extraPath = path;
  }

  private record(line: Record<string, unknown>): void {
    const row = JSON.stringify({ ts: new Date().toISOString(), ...line }) + "\n";
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, row, "utf8");
    if (this.extraPath !== undefined) {
      mkdirSync(dirname(this.extraPath), { recursive: true });
      appendFileSync(this.extraPath, row, "utf8");
    }
  }

  private add(visit: string, parent: string | null, brief: string, origin?: DecisionNode["origin"]): DecisionNode {
    const node: DecisionNode = { id: `d${++this.seq}`, visit, parent, brief, status: "open", at: new Date().toISOString(), ...(origin !== undefined ? { origin } : {}) };
    this.nodes.set(node.id, node);
    return node;
  }

  /** The remedy's map: what is still open, so a wrong ref heals in one turn. */
  private openBriefs(): string {
    const open = [...this.nodes.values()].filter((n) => n.status === "open");
    if (open.length === 0) return "(none open — plan or fork first)";
    const shown = open.slice(-8).map((n) => `${n.id}: ${n.brief}`).join(" · ");
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
  /** Updates landed since anything last CLOSED. The checklist is a progress
   *  view, so a run of narration over a checklist that never moves is the
   *  thing worth saying out loud (owner 2026-07-29). Prose said this
   *  already and prose lost, which is the case for a mechanical nudge.
   *  High enough that ordinary narration passes untouched. */
  private sinceResolve = 0;
  private static readonly NUDGE_AFTER = 5;

  apply(visit: string, u: DecisionOp): Record<string, unknown> {
    this.materialize(visit);
    switch (u.op) {
      case "plan": {
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
        break;
      }
      case "fork": {
        const parent = u.node !== undefined ? this.openNode(u.node).id : (this.activeId !== undefined && this.nodes.get(this.activeId)?.status === "open" ? this.activeId : null);
        // Idempotent for the same reason a plan is — a retried call must not
        // open the same branch twice; it re-enters the one already standing.
        const standingFork = [...this.nodes.values()].find(
          (n) => n.visit === visit && n.parent === parent && n.brief === u.brief && n.status === "open" && n.origin === "fork",
        );
        if (standingFork !== undefined) {
          this.activeId = standingFork.id;
          break;
        }
        const fork = this.add(visit, parent, u.brief!, "fork");
        const added = (u.items ?? []).map((b) => this.add(visit, fork.id, b, "planned"));
        this.activeId = fork.id;
        this.record({ op: "fork", visit, parent, node: fork.id, brief: fork.brief, nodes: added.map((n) => ({ id: n.id, brief: n.brief })) });
        break;
      }
      case "done":
      case "obsolete":
      case "revert": {
        // IDEMPOTENT, for the reason plan and fork already are: the update
        // rides BEFORE the call's verdict, and every refusal's remedy says to
        // repeat the call. So a call refused for some UNRELATED reason comes
        // back with its resolution already applied, and the retry used to be
        // refused for a second, more confusing reason. Re-resolving a node the
        // SAME way is the state we were asked for; only a CONFLICTING
        // re-resolution is a real disagreement worth refusing.
        const already = this.nodes.get(u.node!);
        if (already !== undefined && already.status === CLOSES[u.op]) break;
        const n = this.openNode(u.node!);
        if (u.op === "done") {
          const open = this.openChildren(n.id);
          if (open.length > 0) {
            throw new Rejection({
              clause: CLAUSES.DECISION_UNRESOLVED,
              expected: `every child of ${n.id} resolved before it closes — still open: ${open.map((c) => `${c.id}: ${c.brief}`).join(" · ")}`,
              got: `done on ${n.id} over ${open.length} open child(ren)`,
              remedy: { tool: "(the same call)", args: { update: { op: "done", node: open[0].id, brief: "<how it resolved>" } }, note: "resolve each child (done, or obsolete/revert if it did not survive), then close the parent" },
              source: "engine/decisions.ts resolve",
            });
          }
        }
        this.close(n, CLOSES[u.op], u.brief);
        if (this.activeId !== undefined && this.nodes.get(this.activeId)?.status !== "open") this.activeId = this.openAncestor(n);
        this.record({ op: u.op, visit: n.visit, node: n.id, ...(u.brief !== undefined ? { brief: u.brief } : {}) });
        break;
      }
      case "defer": {
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
            remedy: { tool: "(the same call)", args: { update: { op: "done", node: n.id, brief: "<how it resolved>" } }, note: "chronic deferral is usually a seed in disguise — se_seed_iteration gives it a goal and a vision" },
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
        this.close(n, "deferred", `deferred to ${u.to}`);
        this.parked.push({ state: u.to!, brief: n.brief, hops, trail });
        if (this.activeId === n.id) this.activeId = this.openAncestor(n);
        this.record({ op: "defer", visit: n.visit, node: n.id, brief: n.brief, to: u.to, hops, trail });
        break;
      }
      case "update": {
        // AN UPDATE THAT MOVES NOTHING ON THE CHECKLIST IS NARRATION WEARING
        // progress's clothes (owner, 2026-07-29, watching a board of thirteen
        // yellow items collect a pile of checked leaves underneath).
        //
        // So when a checklist STANDS, an update says which item it is about.
        // With none open there is nothing to attach to and a bare update is
        // exactly right. This is only affordable because the open node map
        // now rides home on every call - naming one costs a glance.
        // SCOPED TO THIS VISIT. Another state's open checklist is not this
        // state's business, and a walk that had moved on would be refused
        // over items it can no longer reach.
        if (u.node === undefined && [...this.nodes.values()].some((n) => n.visit === visit && n.status === "open")) {
          throw new Rejection({
            clause: CLAUSES.DECISION_NODE,
            expected: `update {node, brief} - which item is this about? ${this.openBriefs()}`,
            got: "an update naming no node, with a checklist standing open",
            remedy: { tool: "(the same call)", args: { update: { op: "update", node: "<an open node id>", brief: "..." } }, note: "or resolve one instead - done | obsolete | revert. A fork opens a new branch where you are" },
            source: "engine/decisions.ts update",
          });
        }
        if (u.node !== undefined) this.activeId = this.openNode(u.node).id;
        // EVERY update changes the RENDER (owner ruling 2026-07-27): the
        // brief lands as a checked point under the active node — the log
        // line and the tree always tell the same story, mechanically.
        const point = this.add(visit, this.activeId ?? null, u.brief ?? "");
        this.close(point, "done", undefined);
        this.record({ op: "update", visit, node: point.id, brief: u.brief });
        break;
      }
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
    const nudge = this.sinceResolve >= Decisions.NUDGE_AFTER && open > 0
      ? `${this.sinceResolve} updates since anything closed, with ${open} still open — the checklist is a PROGRESS view. Close what is genuinely done on the NEXT call, not at the end.`
      : undefined;
    return { update: u.op, active: this.activeId ?? null, open, open_nodes: openNodes, ...(nudge !== undefined ? { nudge } : {}) };
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
  stateTodos(stateId: string): { visits: { visit: string; nodes: DecisionNode[] }[]; parked: { brief: string; hops?: number; trail?: string[] }[] } {
    const byVisit = new Map<string, DecisionNode[]>();
    for (const n of this.nodes.values()) {
      if (n.visit !== stateId && !n.visit.startsWith(`${stateId}@`)) continue;
      const list = byVisit.get(n.visit) ?? [];
      list.push(n);
      byVisit.set(n.visit, list);
    }
    return {
      visits: [...byVisit.entries()].map(([visit, nodes]) => ({ visit, nodes })),
      parked: this.parked.filter((p) => p.state === stateId).map((p) => ({ brief: p.brief, ...(p.hops !== undefined ? { hops: p.hops } : {}), ...(p.trail !== undefined ? { trail: p.trail } : {}) })),
    };
  }

  /** Open nodes whose visit belongs to one of the given state ids — the
   *  evidence check: no point may stand open when the work claims done. */
  openFor(stateIds: string[]): DecisionNode[] {
    return [...this.nodes.values()].filter((n) => n.status === "open" && stateIds.some((p) => n.visit === p || n.visit.startsWith(`${p}@`)));
  }

  /** Every visit that recorded decisions, in first-seen order. */
  visits(): string[] {
    const seen: string[] = [];
    for (const n of this.nodes.values()) if (!seen.includes(n.visit)) seen.push(n.visit);
    return seen;
  }
}
