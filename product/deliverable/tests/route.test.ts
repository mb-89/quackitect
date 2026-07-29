// THE ROUTE (owner design 2026-07-29) — a target state and the way there.
// It is SCHEDULING ONLY: it removes no guard and no autonomy rule, it
// collapses round trips. The preview moves nothing at all.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { computeRoute, type RouteNode } from "../engine/route.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

/** A hand-drawn graph, so the search is tested without booting a machine. */
function graph(edges: Record<string, string[]>, priority: Record<string, number> = {}) {
  return (q: string): RouteNode | undefined =>
    edges[q] === undefined
      ? undefined
      : { priority: priority[q] ?? 0.01, demands: {}, nexts: edges[q].map((to) => ({ to, tick: { from: q, to } })) };
}

test("the search finds the FEWEST hops, and says so when there is no way", () => {
  const g = graph({ a: ["b", "c"], b: ["d"], c: ["d"], d: ["e"], e: [], island: [] });
  const r = computeRoute("a", "e", g);
  assert.equal(r.found, true);
  assert.deepEqual(r.steps.map((s) => s.to), ["b", "d", "e"], "three hops, not four - the first way found is the shortest");
  assert.deepEqual(computeRoute("a", "a", g).steps, [], "standing on the target is a route of no hops");
  const none = computeRoute("a", "island", g);
  assert.equal(none.found, false);
  assert.match(String(none.note), /no drawn path/);
  // A cycle terminates rather than searching forever.
  const loop = computeRoute("x", "gone", graph({ x: ["y"], y: ["x"] }));
  assert.equal(loop.found, false);
});

test("the search gives up honestly rather than walking a huge graph", () => {
  const wide: Record<string, string[]> = {};
  for (let i = 0; i < 400; i++) wide[`n${i}`] = [`n${i + 1}`];
  wide.n400 = [];
  const r = computeRoute("n0", "nowhere", graph(wide), 50);
  assert.equal(r.found, false);
  assert.match(String(r.note), /gave up after 50/, "a cap that is hit is NAMED, never silent");
});

test("the blue line: from a cold start to the front desk, every hop named", () => {
  const s = new Session(freshRoot());
  const r = s.route("front_desk");
  assert.equal(r.found, true, JSON.stringify(r));
  assert.equal(r.from, "start");
  // Two of these moves are drawn NOWHERE and are the reason the route needs
  // its own model: entering boot lands on the submachine's start, and
  // reaching its end pops back out to the parent's next state.
  assert.deepEqual(r.steps.map((h) => h.to), [
    "boot/start",
    "boot/read_contract",
    "boot/prepare_idle",
    "boot/end",
    "idle",
    "front_desk",
  ]);
  assert.deepEqual(r.steps[0].tick, { from: "start", to: "boot" }, "each hop carries the exact tick that performs it");
  assert.deepEqual(r.steps[4].tick, { from: "boot/end", advance: true }, "popping out of a submachine is an advance");
  assert.equal(r.steps[5].priority, 0.2, "and every hop carries the weight of ENTERING it");
});

test("the route weighs the slider hop by hop and names where it stops", () => {
  const s = new Session(freshRoot());
  s.setAutonomy(0.1);
  const r = s.route("front_desk");
  assert.equal(r.steps.length, 6, "the whole way is still shown - a closed road does not erase the map");
  assert.equal(r.stops_at?.at, "front_desk");
  assert.match(String(r.stops_at?.why), /above the session autonomy/);
  // Raise the slider and the same route runs clear. A route that ignored
  // the threshold would be a hole straight through contract rule 3.
  s.setAutonomy(1);
  assert.equal(s.route("front_desk").stops_at, undefined);
});

test("the preview MOVES NOTHING", () => {
  const s = new Session(freshRoot());
  const before = s.active();
  s.route("front_desk");
  s.route("nowhere-at-all");
  assert.deepEqual(s.active(), before, "looking is not walking");
});
