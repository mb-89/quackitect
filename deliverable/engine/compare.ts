// THE BINARY-COMPARISON WALK. Ask one pair, write the answer, ask the next.
//
// IT IS A PURE FUNCTION OF (items, judgments), recomputed on every call, and
// that is what makes the walk resumable. Nothing stores a position, so a
// person who stops after nine pairs and comes back next week resumes exactly
// where the recorded answers leave off. The pull works the same way, for the
// same reason.
//
// The method is machines/methods/meth-derive-criteria.md.

/** What one answer says. `>` means the first matters more. */
export type Verdict = ">" | "=" | "<";

export interface Judgment {
  a: string;
  b: string;
  verdict: Verdict;
}

/** THE TWO RELATION KINDS, and the difference decides what may be inferred.
 *
 *  `order` — a strict weak order. Transitive both ways, so a > b and b > c
 *  settles a > c without asking.
 *
 *  `equivalence` — reflexive, symmetric, transitive. Only POSITIVES
 *  propagate: a is-same-as b and b is-same-as c settles a and c, but a
 *  is-NOT-same-as b says nothing at all about c. */
export type RelationKind = "order" | "equivalence";

export interface Ask {
  a: string;
  b: string;
}

export interface WalkResult {
  /** The finished ranking, most important first. Null while pairs remain. */
  order: string[] | null;
  /** The next pair to put. Null when the order is settled. */
  ask: Ask | null;
  /** Pairs actually asked and answered. */
  answered: number;
  /** see dsp-decision-mathematics.md#how-many-there-are-to-settle */
  done: number;
  total: number;
  /** Contradictions among the pairs that were ASKED. Inference cannot
   *  surface one, because a pair it settles is never put to anybody. */
  cycles: string[][];
  /** How often the bottom probe was right. The walk measures its own hint
   *  rather than trusting it. */
  probe_hits: number;
  probe_misses: number;
}

const key = (a: string, b: string): string => `${a}\0${b}`;

/** EQUALITY FIRST, by union-find. Two items the answers call equal are one
 *  node for every later question, so the order relation never has to carry
 *  them separately. */
function equalityGroups(items: string[], js: Judgment[]): Map<string, string> {
  const parent = new Map<string, string>();
  for (const i of items) parent.set(i, i);
  const find = (a: string): string => {
    let r = a;
    while (parent.get(r) !== r) r = parent.get(r) as string;
    return r;
  };
  for (const j of js) {
    if (j.verdict !== "=") continue;
    if (!parent.has(j.a) || !parent.has(j.b)) continue;
    const ra = find(j.a);
    const rb = find(j.b);
    if (ra === rb) continue;
    // The lowest id wins, so a group carries one stable name however it grew.
    if (ra < rb) parent.set(rb, ra);
    else parent.set(ra, rb);
  }
  const out = new Map<string, string>();
  for (const i of items) out.set(i, find(i));
  return out;
}

/** THE TRANSITIVE CLOSURE of `>` over the equality groups. Floyd-Warshall on
 *  a set this size is nothing, and it is the whole reason 660 questions
 *  replace 7,140: a pair the answers already imply is never asked. */
function closeOrder(reps: string[], js: Judgment[], group: Map<string, string>): Set<string> {
  const gt = new Set<string>();
  for (const j of js) {
    if (j.verdict === "=") continue;
    const ga = group.get(j.a);
    const gb = group.get(j.b);
    if (ga === undefined || gb === undefined || ga === gb) continue;
    if (j.verdict === ">") gt.add(key(ga, gb));
    else gt.add(key(gb, ga));
  }
  for (const k of reps) {
    for (const i of reps) {
      if (!gt.has(key(i, k))) continue;
      for (const j of reps) {
        if (gt.has(key(k, j))) gt.add(key(i, j));
      }
    }
  }
  return gt;
}

/** A CYCLE IS A CONTRADICTION SOMEBODY WROTE. After closure, any item that
 *  outranks itself sits on one, and every member of its strongly-connected
 *  group is on the same one. */
function cyclesOf(reps: string[], gt: Set<string>): string[][] {
  const onCycle = reps.filter((r) => gt.has(key(r, r)));
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const r of onCycle) {
    if (seen.has(r)) continue;
    const ring = onCycle.filter((o) => gt.has(key(r, o)) && gt.has(key(o, r)));
    for (const o of ring) seen.add(o);
    out.push(ring.sort());
  }
  return out;
}

/** THE WALK. `items` arrive in HINT ORDER, most important first, because that
 *  is what makes every new item a predicted bottom and the probe worth
 *  making.
 *
 *  Give it every judgment recorded so far. It returns the next pair to ask,
 *  or the finished order. */
export function walk(items: string[], js: Judgment[], kind: RelationKind = "order", pairs?: [string, string][]): WalkResult {
  // THE CLOSURE RUNS OVER EVERY NODE THE JUDGMENTS MENTION, never only the
  // ones being ordered. A > X and X > B settle A > B whether or not X is
  // itself in the pool, and closing over the pool alone throws that away.
  //
  // IT COST TWO ITERATIONS BEFORE ANYBODY SAW IT. The walk kept asking pairs
  // its own edges already implied, because the path between them ran through
  // a requirement that was not a criterion. Both agents read the counter,
  // concluded the state was a hundred judgments of standing debt, and stopped.
  const universe: string[] = [...items];
  const inUniverse = new Set(items);
  for (const j of js) {
    for (const n of [j.a, j.b]) {
      if (inUniverse.has(n)) continue;
      inUniverse.add(n);
      universe.push(n);
    }
  }
  const group = equalityGroups(universe, js);
  // One representative per equality group, keeping the hint order. Only the
  // items being ORDERED appear here; the rest of the universe exists to carry
  // inference and is never asked about or reported.
  const reps: string[] = [];
  const seenRep = new Set<string>();
  for (const i of items) {
    const g = group.get(i) as string;
    if (seenRep.has(g)) continue;
    seenRep.add(g);
    reps.push(g);
  }
  const closureNodes: string[] = [];
  const seenClosure = new Set<string>();
  for (const n of universe) {
    const g = group.get(n) as string;
    if (seenClosure.has(g)) continue;
    seenClosure.add(g);
    closureNodes.push(g);
  }
  const gt = closeOrder(closureNodes, js, group);
  const cycles = cyclesOf(reps, gt);
  const answered = js.length;

  if (kind === "equivalence") return walkEquivalence(items, js, group, reps, answered, cycles, pairs);
  return walkOrder(reps, gt, answered, cycles);
}

/** AN EQUIVALENCE WALK HAS NO ORDER TO BUILD. It asks the candidate pairs the
 *  groups have not already settled, and stops.
 *
 *  THE PAIRS ARE GIVEN, NOT DERIVED. Crossing every flagged item with every
 *  other asks n(n-1)/2 questions, and over a 145-row register that is 10,440
 *  of them. Nobody answers 10,440 questions, so the caller hands over the
 *  pairs actually worth asking about.
 *
 *  Without them this falls back to the full cross product, which is right
 *  only for a genuinely small set.
 *
 *  ONLY POSITIVES PROPAGATE. "a is not the same as b" says nothing about c,
 *  so nothing else can be inferred away. */
function walkEquivalence(
  items: string[],
  js: Judgment[],
  group: Map<string, string>,
  reps: string[],
  answered: number,
  cycles: string[][],
  pairs?: [string, string][],
): WalkResult {
  const all = pairs ?? allPairs(items);
  const open = all.filter(([a, b]) => !settled(a, b, js, group));
  // AN EQUIVALENCE WALK COUNTS PAIRS. Every candidate pair is a question, and
  // the ones already settled are the ones already done.
  const total = all.length;
  const done = total - open.length;
  if (open.length > 0) {
    return { order: null, ask: { a: open[0][0], b: open[0][1] }, answered, done, total, cycles, probe_hits: 0, probe_misses: 0 };
  }
  return { order: reps, ask: null, answered, done, total, cycles, probe_hits: 0, probe_misses: 0 };
}

/** THE ORDER WALK: hint order in, one chain out, and the first pair the
 *  answers do not already settle comes back as the ask. */
function walkOrder(reps: string[], gt: Set<string>, answered: number, cycles: string[][]): WalkResult {
  const above = (a: string, b: string): boolean => gt.has(key(a, b));
  const known = (a: string, b: string): boolean => a === b || above(a, b) || above(b, a);
  const chain: string[] = [];
  let hits = 0;
  let misses = 0;
  for (const x of reps) {
    if (chain.length === 0) {
      chain.push(x);
      continue;
    }
    // THE PROBE: is x below the current bottom? In hint order that is the
    // likeliest answer, and a yes extends the chain for one question.
    const bottom = chain[chain.length - 1];
    if (!known(x, bottom)) return asking(x, bottom, chain, reps, answered, cycles, hits, misses);
    if (above(bottom, x)) {
      chain.push(x);
      hits++;
      continue;
    }
    misses++;
    const slot = search(x, chain, known, above);
    if (typeof slot !== "number") return asking(x, slot.ask, chain, reps, answered, cycles, hits, misses);
    chain.splice(slot, 0, x);
  }
  return { order: chain, ask: null, answered, done: reps.length, total: reps.length, cycles, probe_hits: hits, probe_misses: misses };
}

/** THE MISS COSTS A SEARCH, and only for the item that missed. Binary over
 *  the chain, returning either the slot or the pair it needs answered. */
function search(
  x: string,
  chain: string[],
  known: (a: string, b: string) => boolean,
  above: (a: string, b: string) => boolean,
): number | { ask: string } {
  let lo = 0;
  let hi = chain.length - 1;
  let slot = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (!known(x, chain[mid])) return { ask: chain[mid] };
    if (above(chain[mid], x)) {
      slot = mid + 1;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return slot;
}

/** A pair is settled when the groups already joined them, or when somebody
 *  answered it outright. */
function settled(a: string, b: string, js: Judgment[], group: Map<string, string>): boolean {
  if (group.get(a) === group.get(b)) return true;
  return js.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
}

/** THE FULL CROSS PRODUCT, and the reason a caller should almost never want
 *  it. Ten items is 45 questions; a hundred and forty-five is 10,440. */
function allPairs(items: string[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) out.push([items[i], items[j]]);
  }
  return out;
}

function asking(
  a: string,
  b: string,
  chain: string[],
  reps: string[],
  answered: number,
  cycles: string[][],
  hits: number,
  misses: number,
): WalkResult {
  // AN ORDERING WALK COUNTS ITEMS. The chain holds everything the answers so
  // far have placed; reps is everything there is to place, after equal items
  // have collapsed into one.
  return { order: null, ask: { a, b }, answered, done: chain.length, total: reps.length, cycles, probe_hits: hits, probe_misses: misses };
}
