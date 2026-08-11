// THE PARETO FRONT, COMPUTED. Nobody types it.
//
// Domination is one line of arithmetic — a candidate is dominated when another
// is at least as good on every axis and better on one — so the front and every
// elimination are a FUNCTION of the score table.
//
// WHY THIS EXISTS (owner report 2026-08-08). evaluate-set asked a person to
// TYPE the non-dominated set and the eliminations, both free text. That asks
// somebody to hand-compute an answer the scores already contain, and it lets
// the typed answer disagree with the scores in the same form, silently. The
// owner read the form and asked who eliminates. Nobody does; arithmetic does.
//
// WHAT A PERSON STILL OWES is the judgment arithmetic cannot make: whether an
// elimination is accepted, and anything the numbers do not capture.
//
// NOTHING HERE KNOWS ABOUT THIS REPOSITORY. Candidates, axes and scores are
// the whole vocabulary, so the same code would rank anything.

/** One candidate's score on every axis. A missing axis is UNSCORED, not zero —
 *  see below, because the difference decides whether a front is trustworthy. */
export interface Scored {
  id: string;
  scores: Record<string, number>;
}

export interface Elimination {
  /** The dominated candidate. */
  id: string;
  /** What dominated it. Several may; this is the first in stable order. */
  by: string;
  /** The axes it lost on — where `by` is strictly better. */
  lost_on: string[];
}

export interface ParetoResult {
  /** The non-dominated set, in the order the candidates arrived. */
  front: string[];
  /** Every dominated candidate, with what beat it and where. */
  eliminated: Elimination[];
  /** The best value any candidate reaches on each axis. Generally not a
   *  candidate — the corner the front bends toward. */
  utopia: Record<string, number>;
  /** The worst value on each axis AMONG THE FRONT. Over the whole set it
   *  would be the worst of the losers, which says nothing about the choice. */
  nadir: Record<string, number>;
  /** Axes where every candidate scores the same. A front cannot be told apart
   *  on these, and the method says to ask which of two things that means. */
  flat: string[];
  /** Candidates missing a score on some axis, with the axes. An unscored cell
   *  is not a zero, and a front computed over holes is not a front. */
  incomplete: { id: string; axes: string[] }[];
}

/** Does `a` dominate `b`? At least as good everywhere, strictly better once.
 *
 *  ONLY AXES BOTH CARRY ARE COMPARED. A pair with a hole between them cannot
 *  be judged, and pretending otherwise is how a candidate gets eliminated by a
 *  cell nobody filled. */
function dominates(a: Scored, b: Scored, axes: string[]): boolean {
  const shared = axes.filter((x) => a.scores[x] !== undefined && b.scores[x] !== undefined);
  if (shared.length === 0) return false;
  if (shared.length < axes.length) return false;
  let better = false;
  for (const x of shared) {
    if (a.scores[x] < b.scores[x]) return false;
    if (a.scores[x] > b.scores[x]) better = true;
  }
  return better;
}

/** The front, the eliminations and the two corners, from the scores alone.
 *
 *  HIGHER IS BETTER on every axis. The 0-5 anchors run that way by
 *  construction, so there is no per-axis direction to get wrong. */
export function pareto(candidates: Scored[], axes: string[]): ParetoResult {
  const incomplete = candidates
    .map((c) => ({ id: c.id, axes: axes.filter((x) => c.scores[x] === undefined) }))
    .filter((c) => c.axes.length > 0);
  const front: string[] = [];
  const eliminated: Elimination[] = [];
  for (const c of candidates) {
    const dominator = candidates.find((o) => o.id !== c.id && dominates(o, c, axes));
    if (dominator === undefined) {
      front.push(c.id);
      continue;
    }
    eliminated.push({
      id: c.id,
      by: dominator.id,
      lost_on: axes.filter((x) => (dominator.scores[x] ?? 0) > (c.scores[x] ?? 0)),
    });
  }
  const utopia: Record<string, number> = {};
  const nadir: Record<string, number> = {};
  const flat: string[] = [];
  const onFront = candidates.filter((c) => front.includes(c.id));
  for (const x of axes) {
    const all = candidates.map((c) => c.scores[x]).filter((v): v is number => v !== undefined);
    if (all.length > 0) utopia[x] = Math.max(...all);
    const fr = onFront.map((c) => c.scores[x]).filter((v): v is number => v !== undefined);
    if (fr.length > 0) nadir[x] = Math.min(...fr);
    if (all.length > 1 && Math.min(...all) === Math.max(...all)) flat.push(x);
  }
  return { front, eliminated, utopia, nadir, flat, incomplete };
}

/** Everything the drawing needs, in one shape that knows nothing about us. */
export interface ParetoView {
  axes: string[];
  candidates: Scored[];
  result: ParetoResult;
}

/** One row per candidate per axis, read back out of the stored table.
 *
 *  The columns are candidate, axis, score, anchor, prior_art. Only the first
 *  three are needed to rank; the other two are what makes a 4 or a 5 legal,
 *  and the checker reads them, not this. */
export function readScores(content: string): { candidates: Scored[]; axes: string[] } {
  const byId = new Map<string, Scored>();
  const axes: string[] = [];
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|") || !t.endsWith("|")) continue;
    const cells = t
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    const id = cells[0].replace(/^\[\[|\]\]$/g, "").trim();
    const axis = cells[1].replace(/^\[\[|\]\]$/g, "").trim();
    const score = Number(cells[2]);
    if (id === "" || axis === "" || !Number.isFinite(score)) continue;
    if (!axes.includes(axis)) axes.push(axis);
    const hit = byId.get(id) ?? { id, scores: {} };
    hit.scores[axis] = score;
    byId.set(id, hit);
  }
  return { candidates: [...byId.values()], axes };
}
