// THE DESIGN STRUCTURE MATRIX, and the clustering that makes it readable.
//
// A DSM is one domain's elements on both axes, with a mark where the row
// affects the column. Sorted so that tightly-coupled elements sit next to
// each other, the groups show up as blocks on the diagonal, and a person can
// SEE the structure instead of being told about it.
//
// The method is machines/methods/meth-dsm-clustering.md. Its source names no
// ready-to-run algorithm — it points at Thebeau 2001, Fernandez 1998 and Yu
// 2003 — so the search below is written here.

export interface Dsm {
  /** The elements, in the order the matrix should be drawn. */
  order: string[];
  /** Cluster id per element. Elements with no cluster carry "". */
  cluster: Record<string, string>;
  /** Directed marks: from -> the set it affects. */
  edges: Record<string, string[]>;
  /** WHICH FLOWS MAKE EACH MARK, keyed "from|to". A cell is a SET, and
   *  showing it is showing what the mark is made of. */
  via?: Record<string, string[]>;
}

/** IT IS DETERMINISTIC, AND THAT IS NOT A DETAIL. A stochastic search
 *  reseeded on every look would reorder the matrix each time somebody opened
 *  it, and nothing would be where they left it.
 *
 *  So the shuffle runs off a fixed seed. Same input, same picture, always. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    // xorshift32 — small, fast, and reproducible across every host.
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x100000000;
  };
}

/** Undirected coupling weight between two elements. Direction is collapsed
 *  here ON PURPOSE: clustering asks whether two things interact at all, and
 *  the field's own worked examples (Pimmler & Eppinger) collapse it the same
 *  way. Direction survives for partitioning and tearing, which read the
 *  directed edges. */
function couplingOf(edges: Record<string, string[]>, elements: string[]): Map<string, number> {
  const w = new Map<string, number>();
  const has = new Set(elements);
  for (const [from, tos] of Object.entries(edges)) {
    if (!has.has(from)) continue;
    for (const to of tos) {
      if (!has.has(to) || to === from) continue;
      const k = from < to ? `${from}|${to}` : `${to}|${from}`;
      w.set(k, (w.get(k) ?? 0) + 1);
    }
  }
  return w;
}

const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** A cluster's label, zero-padded so a list of them sorts as numbers. */
const label = (n: number): string => `c${String(n).padStart(2, "0")}`;

/** THE OBJECTIVE: high density inside a cluster, low across the boundary.
 *
 *  An intra-cluster mark scores +1. An inter-cluster mark costs the size of
 *  the two clusters it spans, so a coupling that reaches across a big group
 *  hurts more than one crossing between two small ones. That size penalty is
 *  what stops the search collapsing everything into one cluster. */
function score(elements: string[], cluster: Record<string, string>, w: Map<string, number>): number {
  const size: Record<string, number> = {};
  for (const e of elements) size[cluster[e]] = (size[cluster[e]] ?? 0) + 1;
  let s = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const weight = w.get(pairKey(elements[i], elements[j])) ?? 0;
      if (weight === 0) continue;
      const ca = cluster[elements[i]];
      const cb = cluster[elements[j]];
      if (ca === cb) s += weight;
      else s -= weight * (size[ca] + size[cb]) * 0.5;
    }
  }
  return s;
}

/** CLUSTER, then ORDER so each cluster is contiguous.
 *
 *  A hill-climb: try moving one element to another cluster, keep the move
 *  where the objective improves, stop when a full sweep improves nothing.
 *  Restarts are seeded, so the answer is stable.
 *
 *  `fixed` holds elements a person already placed by hand. Those never move —
 *  a search that overrides a person's decision is a search nobody trusts. */
export function clusterDsm(elements: string[], edges: Record<string, string[]>, fixed: Record<string, string> = {}, seed = 20260808): Dsm {
  const w = couplingOf(edges, elements);
  const free = elements.filter((e) => (fixed[e] ?? "") === "");
  let best: Record<string, string> = {};
  let bestScore = Number.NEGATIVE_INFINITY;
  const rand = rng(seed);
  // THREE RESTARTS. One hill-climb lands in the nearest local optimum, and on
  // a sparse matrix that is often a bad one. Three is enough to escape the
  // worst of them and still return in milliseconds.
  for (let attempt = 0; attempt < 3; attempt++) {
    const cluster: Record<string, string> = {};
    for (const e of elements) cluster[e] = fixed[e] ?? "";
    // Seed: every free element in its own cluster, then let the climb merge.
    // ZERO-PADDED, so the labels sort as numbers rather than as text. Without
    // it c10 lands between c1 and c2, and the cluster list reads as nonsense.
    free.forEach((e, i) => {
      cluster[e] = attempt === 0 ? label(i + 1) : label(Math.floor(rand() * Math.max(1, free.length)) + 1);
    });
    climb(elements, free, cluster, w);
    const s = score(elements, cluster, w);
    if (s > bestScore) {
      bestScore = s;
      best = { ...cluster };
    }
  }
  return { order: orderByCluster(elements, best), cluster: best, edges, via: {} };
}

/** ONE HILL-CLIMB. Try moving each free element to every other cluster, keep
 *  the move where the objective improves, sweep again until a whole pass
 *  improves nothing.
 *
 *  A NEW EMPTY CLUSTER IS ALWAYS ON THE MENU, so an element that belongs
 *  alone can leave rather than being stuck wherever it started. */
function climb(elements: string[], free: string[], cluster: Record<string, string>, w: Map<string, number>): void {
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 200) {
    improved = false;
    const groups = [...new Set(Object.values(cluster))].filter((c) => c !== "");
    for (const e of free) {
      const was = cluster[e];
      let bestHere = was;
      let bestVal = score(elements, cluster, w);
      for (const g of [...groups, label(groups.length + 1)]) {
        if (g === was) continue;
        cluster[e] = g;
        const val = score(elements, cluster, w);
        if (val > bestVal) {
          bestVal = val;
          bestHere = g;
        }
      }
      cluster[e] = bestHere;
      if (bestHere !== was) improved = true;
    }
  }
}

/** THE ROW ORDER IS THE WHOLE POINT OF DRAWING IT. Contiguous clusters make
 *  blocks on the diagonal; a shuffled order makes the same data unreadable.
 *
 *  Clusters come out in a stable order, and unclustered elements come last so
 *  they read as what they are: not yet placed. */
export function orderByCluster(elements: string[], cluster: Record<string, string>): string[] {
  const groups = [...new Set(elements.map((e) => cluster[e] ?? ""))].filter((c) => c !== "").sort();
  const out: string[] = [];
  for (const g of groups) out.push(...elements.filter((e) => cluster[e] === g).sort());
  out.push(...elements.filter((e) => (cluster[e] ?? "") === "").sort());
  return out;
}

/** THE FUNCTION DSM, built from flows. An edge runs from the function that
 *  PRODUCES a flow to the one that CONSUMES it.
 *
 *  Nothing else makes an edge here, which is why a flow is a node rather than
 *  a phrase: two functions naming one flow are connected by construction. */
export function flowEdges(functions: { id: string; inputs: string[]; outputs: string[] }[]): Record<string, string[]> {
  return flowMatrix(functions).edges;
}

/** THE SAME EDGES, PLUS WHAT MADE THEM. Every flow between two functions is
 *  the same relation — this one passes something to that one — so they
 *  AGGREGATE into one mark rather than splitting into one matrix each.
 *
 *  Lindemann's rule is one relation MEANING per matrix, and fifty flows are
 *  fifty instances of one meaning. Splitting them would also fragment the
 *  clustering, and the partitioning is shared by every candidate. */
export function flowMatrix(functions: { id: string; inputs: string[]; outputs: string[] }[]): {
  edges: Record<string, string[]>;
  via: Record<string, string[]>;
} {
  const consumers = new Map<string, string[]>();
  for (const f of functions) {
    for (const flow of f.inputs) consumers.set(flow, [...(consumers.get(flow) ?? []), f.id]);
  }
  const edges: Record<string, string[]> = {};
  const via: Record<string, string[]> = {};
  for (const f of functions) {
    const to = new Set<string>();
    for (const flow of f.outputs) {
      for (const c of consumers.get(flow) ?? []) {
        if (c === f.id) continue;
        to.add(c);
        const k = `${f.id}|${c}`;
        if (!(via[k] ?? []).includes(flow)) via[k] = [...(via[k] ?? []), flow];
      }
    }
    if (to.size > 0) edges[f.id] = [...to].sort();
  }
  for (const k of Object.keys(via)) via[k] = via[k].sort();
  return { edges, via };
}
