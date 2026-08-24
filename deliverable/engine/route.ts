// THE ROUTE — a target state, and the way there.
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
  /** What ENTERING this state asks for. */
  demands: Record<string, string[]>;
  /** What LEAVING it asks for. A transition checks both ends, so a route
   *  that only looked at entry conditions would under-report every exit
   *  read — which is most of them in the boot lane. */
  exit_demands: Record<string, string[]>;
  nexts: { to: string; tick: Record<string, unknown> }[];
}

export interface RouteResult {
  target: string;
  found: boolean;
  steps: RouteStep[];
  /** Set when the search gave up rather than proved unreachability. */
  note?: string;
}

/** A forward route that leaves the machine BOTH ends stand in has gone
 *  round the world: out through the record's end and back in at its start.
 *  The walk on a finished fan leg wants the branch return instead — a
 *  loop-the-machine line is never the intent. */
export function routeWraps(from: string, objective: string, steps: RouteStep[]): boolean {
  const a = from.split("/");
  const b = objective.split("/");
  let n = 0;
  while (n < a.length - 1 && n < b.length - 1 && a[n] === b[n]) n++;
  if (n === 0) return false;
  const prefix = `${a.slice(0, n).join("/")}/`;
  return steps.some((s) => !s.from.startsWith(prefix) || !s.to.startsWith(prefix));
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
        return {
          target,
          found: false,
          steps: [],
          note: `gave up after ${maxVisited} states — the graph is larger than a route should search`,
        };
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
          demands: mergeDemands(node.exit_demands, arriving?.demands),
        });
        if (e.to === target) return { target, found: true, steps: trace(cameFrom, start, target) };
        next.push(e.to);
      }
    }
    frontier = next;
  }
  return { target, found: false, steps: [], note: `no drawn path from ${start} to ${target}` };
}

/** Both ends of a transition, under one key each. A doc demanded by the
 *  leaving state and the arriving one is listed once. */
function mergeDemands(a?: Record<string, string[]>, b?: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const src of [a, b]) {
    for (const [k, v] of Object.entries(src ?? {})) out[k] = [...new Set([...(out[k] ?? []), ...v])];
  }
  return out;
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
