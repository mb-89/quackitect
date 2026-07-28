// compact — the canvas compactor. MECHANICAL, never judgment (owner ruling
// 2026-07-28). No model decides a layout; the same canvas in gives the same
// coordinates out, every time, which is what lets a test pin it.
//
// THE ALGORITHM, in three steps, none of which has a choice in it:
//
//  1. CLUSTER. A drawn group is a cluster, and it owns every node drawn
//     inside it. Nodes in no group cluster by edge connectivity — joined by
//     an arrow means travelling together. Whatever is left is a cluster of
//     one.
//  2. SQUEEZE. Inside each cluster, empty horizontal and vertical bands
//     collapse to a single gap. Relative order never changes, because every
//     node keeps whatever space actually sat before it.
//  3. PULL. Each cluster moves toward the drawing's centre until it would
//     come within a gap of another cluster. It TRANSLATES, so orientation
//     survives: nothing inside a cluster moves relative to anything else
//     inside it, and no cluster passes the centre.
//
// A group node is EXCLUDED from band detection, because its own box spans
// its members and would hide every empty band inside it. It is re-wrapped
// around them afterwards, keeping the padding it was drawn with.
export type CanvasNode = { id: string; type?: string; x: number; y: number; width: number; height: number; [k: string]: unknown };
export type CanvasEdge = { id?: string; fromNode?: string; toNode?: string; [k: string]: unknown };
export type CanvasDoc = { nodes?: CanvasNode[]; edges?: CanvasEdge[]; [k: string]: unknown };

export type Cluster = { id: string; members: string[] };
export type CompactResult = {
  nodes: CanvasNode[];
  clusters: Cluster[];
  moved: { id: string; dx: number; dy: number }[];
  before: { width: number; height: number };
  after: { width: number; height: number };
};

/** The drawing's own rhythm: main.canvas is drawn on 80px gaps. */
export const DEFAULT_GAP = 80;

type Box = { minX: number; minY: number; maxX: number; maxY: number };

function boxOf(nodes: CanvasNode[]): Box {
  return {
    minX: Math.min(...nodes.map((n) => n.x)),
    minY: Math.min(...nodes.map((n) => n.y)),
    maxX: Math.max(...nodes.map((n) => n.x + n.width)),
    maxY: Math.max(...nodes.map((n) => n.y + n.height)),
  };
}

function inside(group: CanvasNode, n: CanvasNode): boolean {
  return n.x >= group.x && n.y >= group.y && n.x + n.width <= group.x + group.width && n.y + n.height <= group.y + group.height;
}

/** Step 1. Ties break by id everywhere, so the clustering is reproducible. */
export function clustersOf(doc: CanvasDoc): Cluster[] {
  const nodes = [...(doc.nodes ?? [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const groups = nodes.filter((n) => n.type === "group");
  const key = new Map<string, string>();

  // A GROUP OWNS WHAT IS DRAWN INSIDE IT. The smallest containing group wins,
  // so a nested group keeps its own members rather than losing them upward.
  for (const n of nodes) {
    if (n.type === "group") continue;
    let best: CanvasNode | undefined;
    for (const g of groups) {
      if (!inside(g, n)) continue;
      if (best === undefined || g.width * g.height < best.width * best.height) best = g;
    }
    if (best !== undefined) key.set(n.id, best.id);
  }
  for (const g of groups) if (!key.has(g.id)) key.set(g.id, g.id);

  // WHAT IS NOT IN A GROUP TRAVELS WITH WHAT IT IS DRAWN TO. Union-find over
  // the edges, and only where BOTH ends are ungrouped — an arrow leaving a
  // group must not drag the group's contents out of it.
  const parent = new Map<string, string>();
  const find = (a: string): string => {
    let r = a;
    while (parent.get(r) !== r) r = parent.get(r)!;
    return r;
  };
  for (const n of nodes) if (!key.has(n.id)) parent.set(n.id, n.id);
  for (const e of doc.edges ?? []) {
    const a = e.fromNode;
    const b = e.toNode;
    if (typeof a !== "string" || typeof b !== "string") continue;
    if (!parent.has(a) || !parent.has(b)) continue;
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue;
    // The smaller id always wins the root, so the result never depends on
    // the order the edges happen to be drawn in.
    if (ra < rb) parent.set(rb, ra);
    else parent.set(ra, rb);
  }
  for (const n of nodes) if (!key.has(n.id)) key.set(n.id, find(n.id));

  const byKey = new Map<string, string[]>();
  for (const n of nodes) {
    const k = key.get(n.id)!;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(n.id);
  }
  return [...byKey.entries()].map(([id, members]) => ({ id, members })).sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** Step 2, one axis. Sweep in order; the space between the furthest edge
 *  reached so far and the next start is EMPTY, and anything past one gap of
 *  it comes out. Overlapping items share a shift, so nothing reorders. */
function squeeze(items: { id: string; lo: number; hi: number }[], gap: number): Map<string, number> {
  const sorted = [...items].sort((a, b) => a.lo - b.lo || (a.id < b.id ? -1 : 1));
  const shift = new Map<string, number>();
  let removed = 0;
  let reach = Number.NEGATIVE_INFINITY;
  for (const it of sorted) {
    if (reach !== Number.NEGATIVE_INFINITY && it.lo - reach > gap) removed += it.lo - reach - gap;
    shift.set(it.id, removed);
    reach = Math.max(reach, it.hi);
  }
  return shift;
}

/** How far a box may travel toward a target before it comes within one gap
 *  of another box. Boxes that do not overlap on the other axis cannot be in
 *  the way, so they never block. */
function travel(me: Box, others: Box[], axis: "x" | "y", want: number, gap: number): number {
  if (want === 0) return 0;
  const lo = axis === "x" ? "minX" : "minY";
  const hi = axis === "x" ? "maxX" : "maxY";
  const olo = axis === "x" ? "minY" : "minX";
  const ohi = axis === "x" ? "maxY" : "maxX";
  let room = Math.abs(want);
  for (const o of others) {
    if (me[olo] >= o[ohi] || o[olo] >= me[ohi]) continue; // not in the way
    const clear = want < 0 ? me[lo] - o[hi] : o[lo] - me[hi];
    if (clear < 0) continue; // behind us on this axis
    room = Math.min(room, Math.max(0, clear - gap));
  }
  return want < 0 ? -room : room;
}

export function compactCanvas(doc: CanvasDoc, opts?: { gap?: number }): CompactResult {
  const gap = opts?.gap ?? DEFAULT_GAP;
  const original = doc.nodes ?? [];
  if (original.length === 0) {
    return { nodes: [], clusters: [], moved: [], before: { width: 0, height: 0 }, after: { width: 0, height: 0 } };
  }
  const before = boxOf(original);
  const clusters = clustersOf(doc);
  const at = new Map<string, { x: number; y: number }>(original.map((n) => [n.id, { x: n.x, y: n.y }]));
  const byId = new Map(original.map((n) => [n.id, n]));
  const size = (id: string) => ({ w: byId.get(id)!.width, h: byId.get(id)!.height });
  const isGroup = (id: string) => byId.get(id)!.type === "group";

  // ── Step 2: squeeze inside each cluster ──────────────────────────────────
  for (const c of clusters) {
    const solid = c.members.filter((id) => !isGroup(id));
    if (solid.length < 2) continue;
    const padded = c.members.filter(isGroup).map((id) => {
      const inner = boxOf(solid.map((m) => byId.get(m)!));
      const g = byId.get(id)!;
      return { id, left: inner.minX - g.x, top: inner.minY - g.y, right: g.x + g.width - inner.maxX, bottom: g.y + g.height - inner.maxY };
    });
    for (const axis of ["x", "y"] as const) {
      const items = solid.map((id) => {
        const p = at.get(id)!;
        const s = size(id);
        const lo = axis === "x" ? p.x : p.y;
        return { id, lo, hi: lo + (axis === "x" ? s.w : s.h) };
      });
      const shift = squeeze(items, gap);
      for (const id of solid) {
        const p = at.get(id)!;
        if (axis === "x") p.x -= shift.get(id)!;
        else p.y -= shift.get(id)!;
      }
    }
    // The group re-wraps its members with the padding it was drawn with.
    for (const g of padded) {
      const inner = boxOf(solid.map((m) => ({ ...byId.get(m)!, ...at.get(m)! })));
      const p = at.get(g.id)!;
      p.x = inner.minX - g.left;
      p.y = inner.minY - g.top;
      byId.get(g.id)!.width = inner.maxX - inner.minX + g.left + g.right;
      byId.get(g.id)!.height = inner.maxY - inner.minY + g.top + g.bottom;
    }
  }

  // ── Step 3: pull the clusters toward the centre ──────────────────────────
  const boxNow = (c: Cluster): Box => boxOf(c.members.map((m) => ({ ...byId.get(m)!, ...at.get(m)! })));
  const all = boxOf(original.map((n) => ({ ...n, ...at.get(n.id)! })));
  const centre = { x: (all.minX + all.maxX) / 2, y: (all.minY + all.maxY) / 2 };
  for (const axis of ["x", "y"] as const) {
    // Farthest first, so the outside comes in before the inside closes up.
    const order = [...clusters].sort((a, b) => {
      const da = Math.abs(centreOf(boxNow(a))[axis] - centre[axis]);
      const db = Math.abs(centreOf(boxNow(b))[axis] - centre[axis]);
      return db - da || (a.id < b.id ? -1 : 1);
    });
    for (const c of order) {
      const mine = boxNow(c);
      const others = clusters.filter((o) => o.id !== c.id).map(boxNow);
      const want = centre[axis] - centreOf(mine)[axis];
      const step = travel(mine, others, axis, want, gap);
      if (step === 0) continue;
      for (const m of c.members) {
        const p = at.get(m)!;
        if (axis === "x") p.x += step;
        else p.y += step;
      }
    }
  }

  const nodes = original.map((n) => ({ ...n, ...at.get(n.id)!, width: byId.get(n.id)!.width, height: byId.get(n.id)!.height }));
  const moved = nodes
    .map((n, i) => ({ id: n.id, dx: n.x - original[i].x, dy: n.y - original[i].y }))
    .filter((m) => m.dx !== 0 || m.dy !== 0);
  const after = boxOf(nodes);
  return {
    nodes,
    clusters,
    moved,
    before: { width: before.maxX - before.minX, height: before.maxY - before.minY },
    after: { width: after.maxX - after.minX, height: after.maxY - after.minY },
  };
}

function centreOf(b: Box): { x: number; y: number } {
  return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
}
