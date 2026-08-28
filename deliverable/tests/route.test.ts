// THE ROUTE — a target state and the way there.
// It is SCHEDULING ONLY: it removes no guard and no autonomy rule, it
// collapses round trips. The preview moves nothing at all.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { computeRoute, type RouteNode } from "../engine/route.ts";
import { Session } from "../engine/session.ts";
import { craftDocs, freshRoot, GUIDANCE, readEverything, workHere } from "./helpers.ts";

/** A hand-drawn graph, so the search is tested without booting a machine. */
function graph(edges: Record<string, string[]>, priority: Record<string, number> = {}) {
  return (q: string): RouteNode | undefined =>
    edges[q] === undefined
      ? undefined
      : { priority: priority[q] ?? 0.01, demands: {}, exit_demands: {}, nexts: edges[q].map((to) => ({ to, tick: { from: q, to } })) };
}

test("the search finds the FEWEST hops, and says so when there is no way", () => {
  const g = graph({ a: ["b", "c"], b: ["d"], c: ["d"], d: ["e"], e: [], island: [] });
  const r = computeRoute("a", "e", g);
  assert.equal(r.found, true);
  assert.deepEqual(
    r.steps.map((s) => s.to),
    ["b", "d", "e"],
    "three hops, not four - the first way found is the shortest",
  );
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
  // idle used to sit between boot/end and front_desk. It is gone from the
  // state machine, so boot lands on front_desk in one hop, not two, and the
  // stop no longer repeats.
  assert.deepEqual(
    r.steps.map((h) => h.to),
    ["boot/start", "boot/read_contract", "boot/prepare_desk", "boot/end", "front_desk"],
  );
  assert.deepEqual(r.steps[0].tick, { from: "start", to: "boot" }, "each hop carries the exact tick that performs it");
  assert.deepEqual(r.steps[4].tick, { from: "boot/end", advance: true }, "popping out of a submachine is an advance");
  // Five hops now, not six, so the last one sits at index 4.
  assert.equal(r.steps[4].priority, 0.2, "and every hop carries the weight of ENTERING it");
});

// THE DESK STOPPED BEING A BLOCKABLE TARGET.
// This case used to run at 0.1 and shut at the front desk, back when mechanical
// was 0.01 and the desk 0.2. Both sit on the mechanical rung now, so no dial
// opens the boot lane and shuts the desk.
//
// It takes a target on a HIGHER RUNG, and overhaul is one: strategic, 0.8. At
// 0.2 the whole mechanical way is open and that last door is shut, which is the
// hop-by-hop weighing this case exists to prove.
test("the route weighs the dial hop by hop and names where it stops", () => {
  const s = new Session(freshRoot());
  s.setAutonomy(0.2);
  const r = s.route("overhaul");
  assert.equal(r.steps.length, 6, "the whole way is still shown - a closed road does not erase the map");
  assert.equal(r.stops_at?.at, "overhaul", "it names the hop the dial shuts");
  assert.match(String(r.stops_at?.why), /above this session's \w+/);
  // Raise the dial and the same route runs clear. A route that ignored
  // the threshold would be a hole straight through contract rule 3.
  s.setAutonomy(1);
  assert.equal(s.route("overhaul").stops_at, undefined);
});

test("the route collects every judgment and every document up front", () => {
  const s = new Session(freshRoot());
  s.setAutonomy(1);
  const clear = s.route("front_desk");
  assert.deepEqual(clear.judgments, [], "nothing to ask at full autonomy");
  // EVERY doc the whole way demands, gathered once - this is what lets a
  // sweep be one call. Exit conditions count: most of the boot lane's
  // reads are demanded on the way OUT of a state, not into it.
  // AGENTS.md was an exit-condition read until it was promoted, and the
  // contract followed it into the prompt layer. Software and ux then left
  // the guidance root for applies_to, so no doc rides EVERY packet any more
  // and what the route collects is what the way itself pulls.
  assert.ok(!clear.reads.includes(GUIDANCE.contract), "a promoted source never rides the route");
  assert.ok(!clear.reads.some((p) => craftDocs().includes(p)), "and craft guidance rides only the states it names");
  assert.ok(clear.reads.includes(GUIDANCE.frontDeskMethod), "and guidance the target PULLS, which no condition names");
  // Lowered, every hop needing a person is listed - not just the first, so
  // they can all be answered in one sitting.
  s.setAutonomy(0);
  const asked = s.route("front_desk");
  assert.ok(asked.judgments.length >= 2, `every blocked hop is named, got ${asked.judgments.length}`);
  assert.equal(asked.stops_at?.at, asked.judgments[0].at, "and the first one is where it stops");
});

test("the sweep walks the whole way in one call, and every guard still fires", async () => {
  const root = freshRoot();
  const s = new Session(root);
  s.setAutonomy(1);
  // BOOT'S OWN MARKED STEP STOPS IT FIRST, because a state is not left while
  // it holds open work. Do the step, the way a walker does, and sweep again —
  // then the read proof is the thing standing in the way.
  const held = await s.sweep("front_desk", "agent");
  assert.equal(held.arrived, false, "an open step holds its state shut");
  assert.deepEqual(s.active(), ["boot/prepare_desk"]);
  assert.ok(workHere(s) > 0, "and the step is the fixture's to do");
  // WITHOUT the reading it stops, typed, exactly where the guard is.
  const short = await s.sweep("front_desk", "agent");
  assert.equal(short.arrived, false, "the read proof is not waived by sweeping");
  assert.equal((short.refusal as { clause: string }).clause, "SE-C-112");
  assert.ok((short.swept as string[]).length > 0, "and the hops it DID make stand");
  // The stop has now moved THREE times, and where it lands is not the point.
  // refusals.md joined the guidance ROOT, and a root doc rides every packet,
  // so the first hop that demands reading is the one out of boot. Before that
  // it was the desk's method card; before that, software and ux at the root.
  // What this guards is that the sweep STOPS on an unmet read proof and
  // stands where it got to, never rolling back.
  assert.deepEqual(s.active(), ["boot/end"], "the walk stands where it got to, never rolled back");
  // WITH the reading earned through the loop, the same call arrives.
  await readEverything(s);
  const done = await s.sweep("front_desk", "agent");
  assert.equal(done.arrived, true, JSON.stringify(done.refusal ?? done.note));
  assert.deepEqual(s.active(), ["front_desk"]);
});

test("the sweep stops at the slider, and the target defaults to the front desk", async () => {
  const root = freshRoot();
  const s = new Session(root);
  assert.equal(s.target, "front_desk", "every engine start aims at the desk");
  // The desk shares the mechanical rung since the tier cut-over, so it can no
  // longer be the door the dial shuts. Expeditions at 0.4 is the nearest one
  // that can, and the aim is set before the reading so the walk heads there.
  s.setAutonomy(0.2);
  s.setTarget("expeditions");
  await readEverything(s);
  const out = await s.sweep("expeditions", "agent");
  assert.equal(out.arrived, false, "a sweep never walks past the dial");
  assert.deepEqual(s.active(), ["front_desk"], "it goes as far as it may and stops there");
  assert.equal((out.refusal as { clause: string }).clause, "SE-C-113");
  // Aiming somewhere the drawing cannot reach is refused, not stored.
  assert.throws(() => s.setTarget("nowhere-at-all"));
  assert.equal(s.target, "expeditions", "so the blue line never points at nowhere");
});

test("the drawing carries the route: a spline OVER the nodes, its stops, an arrow", async () => {
  const { renderMirror, routeOverlay } = await import("../engine/render.ts");
  const root = freshRoot();
  const s = new Session(root);
  // The projection gives the ORDERED stops. Hops running around inside one
  // state make it a WAYPOINT, which is what a submachine entered and left is.
  const { waypoints, path } = routeOverlay(s.route("front_desk").steps, "");
  // idle used to project to its own repeated front_desk stop. Gone now, so
  // the projected path is one stop shorter.
  assert.deepEqual(path, ["start", "boot", "front_desk"]);
  assert.deepEqual([...waypoints], ["boot"], "boot is passed through, so it is a waypoint");
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });

  // THE LINE IS DRAWN OVER THE NODES, never along the drawn edges. Riding the
  // edges read as the graph highlighting itself, which is not a route.
  assert.equal(html.split("onroute").length - 1, 0, "the route no longer rides the edges");
  // Canvas coordinates go NEGATIVE — the drawing's origin is not its corner.
  assert.match(html, /<path d="M -?[\d.]+ -?[\d.]+ C [^"]+" fill="none" class="route-line"\/>/, "one spline through the stops");

  // A waypoint and the destination are the SAME mark: boot and front_desk,
  // plus the one stylesheet rule. idle is a stop the line merely crosses, so
  // it carries none — the owner's invisible waypoint.
  // Count the ELEMENTS, not every mention — the stylesheet names the class too.
  assert.equal(html.split('class="route-stop"').length - 1, 2);
  assert.equal(html.split("route-here").length - 1, 2, "an arrow says where you are");
  assert.match(
    html,
    /class="route-here" transform="translate\(-?[\d.]+ -?[\d.]+\) rotate\(-?[\d.]+\)"/,
    "and it faces the way the line goes",
  );

  // Blue, because the voice keeps green, red and yellow for verdicts.
  assert.match(html, /\.route-line \{ fill: none; stroke: var\(--se-walk\)/);
});

// THE ONE MOMENT THE MAP LIES. An unbroken blue
// line to the destination says the whole way is open. When the slider blocks a
// hop it is not, and the reader has no way to see that the walk will stop
// short and wait for their hand.
test("a blocked route draws a closure, and the way past it is FADED", async () => {
  const { renderMirror } = await import("../engine/render.ts");
  const root = freshRoot();
  const s = new Session(root);
  // 0.2 opens the whole mechanical boot lane and shuts overhaul, which is
  // strategic at 0.8 — so the drawing carries an open stretch AND a closure.
  // It used to shut at the front desk; the tier cut-over of 2026-08-12 put the
  // desk on the mechanical rung, so closing anything now takes a heavier door.
  s.setAutonomy(0.2);
  s.setTarget("overhaul");
  assert.equal(s.route("overhaul").stops_at?.at, "overhaul");
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });

  assert.match(html, /class="route-line"\/>/, "the open part is drawn normally");
  assert.match(html, /class="route-line shut"\/>/, "and the way past the closure carries its own class");
  assert.match(html, /class="route-shut"/, "with a barrier laid across the line");
  // Faded, never hidden: the way EXISTS, it is shut.
  assert.match(html, /\.route-line\.shut \{ opacity: \.28; \}/);
  assert.ok(html.includes("above this session's"), "and the barrier says why, in the tier's own word");
});

// THE SAME LIE AT A CONTAINER'S DOOR (i11's audit, from the 2026-08-12 seed).
//
// The case above shuts a plain state. A CONTAINER is the harder half and the
// seed names it: at 0.2 the pull refuses to enter expeditions, whose door
// weighs 0.4 — but entering a submachine resolves to its START state, which is
// mechanical. If the route weighs the state ENTERED rather than the door, the
// line reads open the whole way and the walk then stops anyway.
test("a container's own weight shuts the route, not its start state's", () => {
  const s = new Session(freshRoot());
  s.setAutonomy(0.2);
  const r = s.route("expeditions");
  assert.equal(r.found, true, "the way is drawn");
  // THE STOP LANDS WHERE THE WALK WOULD: the container's start, which is the
  // state actually entered. What was missing was the WEIGHT, not the name.
  assert.equal(r.stops_at?.at, "expeditions/start", `the route must shut at the container: ${JSON.stringify(r.stops_at)}`);
  assert.match(r.stops_at?.why ?? "", /operational work, above this session's mechanical/, "and it says whose weight shut it");
});

// A TARGET YOU CANNOT NAME IS NOT A TARGET (found live 2026-07-29). The search
// expands a submachine into its inner states, so the container's own id was
// never a node in the graph. Aiming at "expeditions" was refused as unreachable
// from idle -- a hop the walk offers directly and the agent had just taken.
test("a submachine can be aimed at by its container name", () => {
  const s = new Session(freshRoot());
  const r = s.route("expeditions");
  assert.equal(r.found, true, "the container names a place the drawing can reach");
  assert.equal(s.setTarget("expeditions").target, "expeditions", "and it is stored as the reader named it");
  // A plain state is untouched by the normalisation.
  assert.equal(s.route("front_desk").found, true);
});

test("a target clears itself once reached", async () => {
  const root = freshRoot();
  const s = new Session(root);
  s.setAutonomy(1);
  await readEverything(s);
  const out = await s.sweep("front_desk", "agent");
  assert.equal(out.arrived, true, JSON.stringify(out.refusal ?? out.note));
  assert.deepEqual(s.active(), ["front_desk"]);
  assert.equal(s.target, "", "one-shot target should clear after arrival");
});

test("an empty target clears the current aim explicitly", () => {
  const s = new Session(freshRoot());
  s.setTarget("front_desk");
  const cleared = s.setTarget("");
  assert.equal(cleared.target, "");
  assert.equal(s.target, "");
});

test("the preview MOVES NOTHING", () => {
  const s = new Session(freshRoot());
  const before = s.active();
  s.route("front_desk");
  s.route("nowhere-at-all");
  assert.deepEqual(s.active(), before, "looking is not walking");
});

// TSP-EVERY-HOP-RECORDS-HOW-LONG-IT-TOOK. A call may carry many hops, so one
// duration for the call cannot answer what a hop cost. The unit is the hop.
test("every hop the search returns carries how long it took", () => {
  const g = graph({ a: ["b"], b: ["c"], c: [] });
  const began = performance.now();
  const r = computeRoute("a", "c", g);
  const whole = performance.now() - began;

  assert.equal(r.found, true);
  assert.equal(r.steps.length, 2, "two hops from a to c");

  let sum = 0;
  for (const s of r.steps) {
    const ms = (s as { ms?: unknown }).ms;
    // FINITE AND NOT NEGATIVE, never merely "a number". `typeof NaN` is
    // "number", so the weaker check stays green on a duration that was never
    // computed — which is the one failure this row exists to catch.
    assert.ok(typeof ms === "number" && Number.isFinite(ms) && ms >= 0, `hop to ${s.to} records ${String(ms)} rather than a real duration`);
    sum += ms;
  }

  // THE HOPS FIT INSIDE THE CALL. A per-hop figure that outgrew the call it
  // came from would be measuring something other than the hop.
  //
  // THIS HOLDS BY CONSTRUCTION TODAY and a reviewer said so: `whole` times the
  // same call whose hops produced `sum`, so each figure is a sub-interval of it.
  // Keep it anyway — it bites the day somebody makes `ms` cumulative or sources
  // it from somewhere other than the hop. Do not count it as a second
  // independent guard.
  //
  // NOT ASSERTED ABOVE ZERO, deliberately. A hop times one expand, a warm
  // expand costs about a tenth of a millisecond, and a memoized one rounds to
  // zero. Demanding a positive number would make the test fail on the machine
  // doing the least work.
  assert.ok(sum <= whole, `the hops sum to ${sum} ms inside a call that took ${whole} ms`);
});

// TSP-A-FAILED-ROUTE-ANSWERS-NO-SLOWER-THAN-A-DRAWN-ONE. The id keeps an older
// name and the row no longer means it: "no slower than a drawn one" was struck
// as impossible, because saying there is no way means looking everywhere
// reachable while finding one stops at the first.
//
// WHAT THE ROW DEMANDS NOW is that a failed search stays bounded by the graph —
// each reachable state expanded once, never twice — which is what catches a
// search that runs on. Timing in a unit test is flaky, so this asserts the COUNT
// the timing is about.
//
// REPORTING THE COUNT IS NOT THE CLAIM, and an earlier version of this case
// asserted only that both counts were numbers. A failed search could have
// expanded four hundred thousand states and stayed green.
test("a search that finds nothing costs no more than exhausting the graph", () => {
  const REACHABLE = 41; // n0 through n40
  const wide: Record<string, string[]> = {};
  for (let i = 0; i < 40; i++) wide[`n${i}`] = [`n${i + 1}`];
  wide.n40 = [];
  const g = graph(wide);

  const near = computeRoute("n0", "n1", g);
  const none = computeRoute("n0", "nowhere", g);
  assert.equal(near.found, true);
  assert.equal(none.found, false);

  // THE BOUND IS THE GRAPH. Each state is expanded at most once, so a search
  // for something absent walks every reachable state and then stops. Expanding
  // more than that means it revisited, which is the unbounded case.
  assert.ok(
    none.visited <= REACHABLE,
    `a failed search expanded ${none.visited} of ${REACHABLE} reachable states — above that it is revisiting`,
  );

  // AND THE SUCCESSFUL SEARCH LEAVES EARLY. It stops at the first way it finds,
  // so it expands strictly fewer states than one that has to exhaust the set.
  //
  // THIS IS NOT THE REQUIREMENT'S MEASURE, and an earlier version read as though
  // it were — which had the case asserting the reverse of what the row demanded.
  // The row demands the FAILED search stay bounded, and that is the assertion
  // above. This one shows the early return.
  assert.ok(near.visited < none.visited, `finding at one hop expanded ${near.visited} against ${none.visited} for finding nothing`);
});
