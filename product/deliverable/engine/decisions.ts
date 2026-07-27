// The decision graph — the agent's thought process as a per-state tree
// (owner design, first captured 2026-07-25 in v2's i9 notes; built here).
// Every task started is a NODE. Every node started gets RESOLVED: done,
// obsolete, or reverted — abandoning is legal, abandoning silently is not.
// Depth of forking IS the measure of drift; the retro reads the file.
//
// Ops arrive as the `update` field riding any lane call. The live graph is
// in-memory (session-scoped, like the walk); every op also appends to
// .se/decisions.jsonl — replayable, and the retro's raw material.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

export interface DecisionNode {
  id: string;
  visit: string;
  parent: string | null;
  brief: string;
  status: "open" | "done" | "obsolete" | "reverted";
  at: string;
  closed_at?: string;
  resolution?: string;
}

export interface DecisionOp {
  op: "plan" | "fork" | "done" | "obsolete" | "revert" | "update";
  brief?: string;
  items?: string[];
  node?: string;
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
  "update {brief, node?} says what you are doing";

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
  if (!(op in CLOSES) && op !== "plan" && op !== "fork" && op !== "update") throw malformed(`op: ${JSON.stringify(u.op)}`);
  const items = u.items === undefined ? undefined : Array.isArray(u.items) ? u.items.map(String).filter((s) => s.trim() !== "") : null;
  if (items === null) throw malformed("items is not an array of strings");
  const brief = u.brief === undefined ? undefined : String(u.brief);
  const node = u.node === undefined ? undefined : String(u.node);
  if (op === "plan" && (items === undefined || items.length === 0)) throw malformed("plan without items");
  if (op === "fork" && (brief === undefined || brief.trim() === "")) throw malformed("fork without brief");
  if (op in CLOSES && node === undefined) throw malformed(`${op} without node`);
  if (op === "update" && (brief === undefined || brief.trim() === "")) throw malformed("update without brief");
  return { op: op as DecisionOp["op"], ...(brief !== undefined ? { brief } : {}), ...(items !== undefined ? { items } : {}), ...(node !== undefined ? { node } : {}) };
}

export class Decisions {
  readonly path: string;
  private readonly nodes = new Map<string, DecisionNode>();
  private activeId?: string;
  private seq = 0;

  constructor(seDirPath: string) {
    this.path = join(seDirPath, "decisions.jsonl");
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

  private add(visit: string, parent: string | null, brief: string): DecisionNode {
    const node: DecisionNode = { id: `d${++this.seq}`, visit, parent, brief, status: "open", at: new Date().toISOString() };
    this.nodes.set(node.id, node);
    return node;
  }

  /** The remedy's map: what is still open, so a wrong ref heals in one turn. */
  private openBriefs(): string {
    const open = [...this.nodes.values()].filter((n) => n.status === "open");
    return open.length === 0 ? "(none open — plan or fork first)" : open.map((n) => `${n.id}: ${n.brief}`).slice(-8).join(" · ");
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

  apply(visit: string, u: DecisionOp): Record<string, unknown> {
    switch (u.op) {
      case "plan": {
        const parent = u.node === undefined ? null : this.openNode(u.node).id;
        const added = (u.items ?? []).map((b) => this.add(visit, parent, b));
        if (this.activeId === undefined) this.activeId = added[0]?.id;
        this.record({ op: "plan", visit, parent, nodes: added.map((n) => ({ id: n.id, brief: n.brief })) });
        break;
      }
      case "fork": {
        const parent = u.node !== undefined ? this.openNode(u.node).id : (this.activeId !== undefined && this.nodes.get(this.activeId)?.status === "open" ? this.activeId : null);
        const fork = this.add(visit, parent, u.brief!);
        const added = (u.items ?? []).map((b) => this.add(visit, fork.id, b));
        this.activeId = fork.id;
        this.record({ op: "fork", visit, parent, node: fork.id, brief: fork.brief, nodes: added.map((n) => ({ id: n.id, brief: n.brief })) });
        break;
      }
      case "done":
      case "obsolete":
      case "revert": {
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
      case "update": {
        if (u.node !== undefined) this.activeId = this.openNode(u.node).id;
        this.record({ op: "update", visit, node: this.activeId ?? null, brief: u.brief });
        break;
      }
    }
    const open = [...this.nodes.values()].filter((n) => n.status === "open").length;
    return { update: u.op, active: this.activeId ?? null, open };
  }

  /** One state visit's tree, insertion-ordered — the mirror renders this. */
  graph(visit: string): { visit: string; active: string | null; nodes: DecisionNode[] } {
    const nodes = [...this.nodes.values()].filter((n) => n.visit === visit);
    const active = this.activeId !== undefined && this.nodes.get(this.activeId)?.visit === visit ? this.activeId : null;
    return { visit, active, nodes };
  }

  /** Every visit that recorded decisions, in first-seen order. */
  visits(): string[] {
    const seen: string[] = [];
    for (const n of this.nodes.values()) if (!seen.includes(n.visit)) seen.push(n.visit);
    return seen;
  }
}
