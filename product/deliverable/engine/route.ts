// THE ROUTE — a target state, and the way there (owner design 2026-07-29).
//
// IT IS SCHEDULING, AND NOTHING ELSE. A route removes no guard, no
// condition and no autonomy rule. It collapses model ROUND TRIPS: today
// reaching idle from a cold start is six separate turns, each one a packet
// asking what to do next, when the answer was knowable at the first.
//
// The everyday frame is `make`. Name a target, compute what is needed, run
// it, halt on the first thing that will not pass. Orchestration engines do
// the same with a shortest path over the state graph.
//
// THIS FILE IS PURE GRAPH SEARCH. It knows nothing about submachines,
// generated containers or conditions — the caller supplies `expand`, which
// owns all of that. Keeping the seam here is what makes the search
// testable without booting a machine.
export interface RouteStep {
  /** Qualified state id this step leaves. */
  from: string;
  /** Qualified state id it arrives at. */
  to: string;
  /** The exact tick that performs it — send this, unchanged. */
  tick: Record<string, unknown>;
  /** The weight of ENTERING `to`. The sweep weighs every one of these. */
  priority: number;
  /** The target's entry conditions, by type. What will be ASKED — never a
   *  claim that it will pass; a script has to run to answer. */
  demands: Record<string, string[]>;
}

export interface RouteNode {
  priority: number;
  demands: Record<string, string[]>;
  nexts: { to: string; tick: Record<string, unknown> }[];
}

export interface RouteResult {
  target: string;
  found: boolean;
  steps: RouteStep[];
  /** Set when the search gave up rather than proved unreachability. */
  note?: string;
}

/** Breadth-first, so the answer is the FEWEST hops. Ties are broken by the
 *  order the drawing lists the edges, which is the order a reader sees. */
export function computeRoute(
  start: string,
  target: string,
  expand: (qualified: string) => RouteNode | undefined,
  maxVisited = 512,
): RouteResult {
  if (start === target) return { target, found: true, steps: [] };
  const cameFrom = new Map<string, RouteStep>();
  const seen = new Set<string>([start]);
  let frontier = [start];
  let visited = 0;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const q of frontier) {
      if (++visited > maxVisited) {
        return { target, found: false, steps: [], note: `gave up after ${maxVisited} states — the graph is larger than a route should search` };
      }
      const node = expand(q);
      if (node === undefined) continue;
      for (const e of node.nexts) {
        if (seen.has(e.to)) continue;
        seen.add(e.to);
        const arriving = expand(e.to);
        cameFrom.set(e.to, {
          from: q,
          to: e.to,
          tick: e.tick,
          priority: arriving?.priority ?? 0,
          demands: arriving?.demands ?? {},
        });
        if (e.to === target) return { target, found: true, steps: trace(cameFrom, start, target) };
        next.push(e.to);
      }
    }
    frontier = next;
  }
  return { target, found: false, steps: [], note: `no drawn path from ${start} to ${target}` };
}

function trace(cameFrom: Map<string, RouteStep>, start: string, target: string): RouteStep[] {
  const out: RouteStep[] = [];
  let at = target;
  while (at !== start) {
    const step = cameFrom.get(at);
    if (step === undefined) break;
    out.unshift(step);
    at = step.from;
  }
  return out;
}
