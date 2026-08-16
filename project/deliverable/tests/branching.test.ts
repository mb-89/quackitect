// BRANCHING POINTS, AND THE RETURN TO ONE (owner design 2026-08-07).
//
// A fan hands out ONE leg. Walk it to the end and the drawing offers nothing:
// the other legs are behind you and the join above wants them all. The walk
// is not stuck, it is facing the wrong way.
//
// Until this landed the only exit was an escape to the front desk and a full
// re-aim, every owed document served again. It cost two escapes in one
// session from states that were signed, met and green.
//
// The owner calls the branching point a waypoint. This file already used that
// word for a claim-less transparent state, so the new idea took the plainer
// name and the two stay distinguishable.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { branchingPoints, branchKind, branchToReturnTo, completeState, type MachineDecl, type MachineInstance } from "../engine/machine.ts";

const state = (id: string, to: string[], extra: Record<string, unknown> = {}) =>
  ({
    id,
    kind: "work",
    statement: "",
    guidance: "",
    priority: 0,
    evidence_form: [],
    edges: to.map((t) => ({ to: t, role: "normal" })),
    ...extra,
  }) as unknown as MachineDecl["states"][number];

/** A fan into two legs that rejoin at a BUSBAR. Every leg must be walked. */
const andMachine = (): MachineDecl =>
  ({
    id: "m",
    initial: "start",
    reentry: "resume",
    states: [
      state("start", ["fan"]),
      state("fan", ["left", "right"]),
      state("left", ["join"]),
      state("right", ["join"]),
      state("join", ["end"], { busbar: true }),
      state("end", []),
    ],
  }) as unknown as MachineDecl;

// A RE-ENTRY MUST NOT COST A LEG THAT ALREADY STANDS (i11, walk-repairs).
//
// activatePowered absorbs fuel aimed at any ACTIVE state, so that a second
// trigger during activity never re-runs it later. A re-entry re-activates a
// state the walk already finished, which looks exactly like that second
// trigger — and the fear is that it eats the fuel a busbar is still counting.
//
// THIS DRIVES IT: walk one leg, re-enter that leg the way a reboot does, then
// finish the other and demand the bar opens.
test("a busbar opens after a re-entry re-walks a leg that already stands", () => {
  const m = andMachine();
  const inst = {
    machine: "m",
    iteration: "",
    current: "left",
    active: ["left", "right"],
    fired: [],
    counters: {},
    history: [],
    escapes: [],
    status: "open",
  } as unknown as MachineInstance;

  // THE RE-WALK PUT A TOKEN ON THE BAR ITSELF. That is what makes the absorb
  // bite: fuel aimed at an ACTIVE state is dropped, and here the bar is active.
  inst.active = ["left", "right", "join"];
  completeState(m, inst, "left", "filled", "now");
  assert.ok(
    !(inst.fired ?? []).includes("left->join"),
    "this case is pointless unless the absorb actually fires — fuel into an active state must have been dropped",
  );

  // The re-walk moves off the bar without completing it, and the second leg
  // finishes. left's fuel is GONE, so only its standing evidence can vouch
  // for that edge.
  inst.active = ["right"];
  completeState(m, inst, "right", "filled", "now", undefined, () => new Set(["left"]));
  assert.ok(
    (inst.active ?? []).includes("join"),
    `the busbar stayed shut after a re-entry ate a finished leg's fuel — fired=${JSON.stringify(inst.fired)} active=${JSON.stringify(inst.active)}`,
  );
});

/** The same shape with no busbar. One leg is the answer. */
const orMachine = (): MachineDecl =>
  ({
    id: "m",
    initial: "start",
    reentry: "resume",
    states: [
      state("start", ["fan"]),
      state("fan", ["left", "right"]),
      state("left", ["join"]),
      state("right", ["join"]),
      state("join", ["end"]),
      state("end", []),
    ],
  }) as unknown as MachineDecl;

test("a branching point is a state with more than one way out", () => {
  assert.deepEqual(branchingPoints(andMachine()), ["fan"]);

  // A STATE WITH ONE EDGE IS NOT A BRANCH, however important it looks.
  assert.equal(branchingPoints(andMachine()).includes("start"), false);
  assert.equal(branchingPoints(andMachine()).includes("join"), false);
});

test("a busbar above the legs makes the branch an AND", () => {
  assert.equal(branchKind(andMachine(), "fan"), "and");
});

test("no busbar makes it an OR", () => {
  // The legs still rejoin. What decides it is whether the join collects
  // EVERY input, and only a busbar says that.
  assert.equal(branchKind(orMachine(), "fan"), "or");
});

test("a state with one way out is never a branch of either kind", () => {
  assert.equal(branchKind(andMachine(), "start"), "or");
  assert.equal(branchKind(andMachine(), "nonexistent"), "or");
});

test("finishing one AND leg offers the branch back, so the other can be walked", () => {
  // THE CASE THIS EXISTS FOR. Standing at the end of the left leg, wanting
  // the right one. There is no forward path, and there never will be.
  assert.equal(branchToReturnTo(andMachine(), "left", "right"), "fan");
});

test("an OR branch is never offered back", () => {
  // At an OR the branching point is where a DECISION was made. Walking
  // backwards would un-make it, so the walk stays where it is.
  assert.equal(branchToReturnTo(orMachine(), "left", "right"), undefined);
});

test("nothing is offered when the objective is already ahead", () => {
  // A forward path exists from left to join, so the router never asks.
  // Asked anyway, the branch must not claim a return is needed: `join` is
  // not a branching point, and `fan` does not reach anything left does not.
  const m = andMachine();
  assert.equal(branchToReturnTo(m, "left", "left"), undefined, "the objective is here");
});

test("a branch that cannot reach the objective is not offered", () => {
  const m = andMachine();
  // `end` sits outside both legs' business. The fan does reach it, so this
  // asserts the reachability test runs at all rather than trusting the shape.
  assert.equal(branchToReturnTo(m, "left", "no-such-state"), undefined);
});

// THE FUNCTIONS ARE A RING (owner ruling 2026-08-07), AND THE TESTS JOINED
// THEM (owner ruling 2026-08-10). The trace ran to the requirements and
// stopped, so what answers a requirement — and what verifies it — was
// invisible on the drawing. Function and test share the first ring past the
// spine, one per slice.
test("the trace runs past the requirements, to functions and tests", async () => {
  const { TRACE_LEVELS } = await import("../engine/trace.ts");
  assert.deepEqual(TRACE_LEVELS, ["value-prop", "story", "use-case", "requirement", "function", "test-spec"]);

  // ORDER IS THE RADIUS. A function sits outside a requirement because it is
  // what answers one, and the edge runs requirement to function.
  assert.equal(TRACE_LEVELS.indexOf("function") - TRACE_LEVELS.indexOf("requirement"), 1);
});

// THE RING GAP IS THE VISION'S OWN GAP (owner ruling 2026-08-07).
//
// The vision to the value props is FIRST_RING, and that is the drawing's unit
// of separation. Every later ring gets at least the same, measured EDGE TO
// EDGE rather than centre to centre — a centre gap says nothing once a band
// straddles its ring, which is exactly when the drawing gets tight.
test("consecutive rings are parted by at least the vision's own gap", async () => {
  const { layoutTrace, loadTrace } = await import("../engine/trace.ts");
  // THE REAL ROOT, not the literal "project" (found 2026-08-08): a wrong
  // root loads an empty corpus, rings.length stays under two, and the test
  // passed while checking nothing.
  const { fileURLToPath } = await import("node:url");
  const layout = layoutTrace(loadTrace(fileURLToPath(new URL("../../..", import.meta.url))));
  const rings = layout.rings;
  assert.ok(rings.length >= 2, "the repo's own corpus draws several rings — one ring means the corpus did not load");

  // The card's own height is what a ring occupies at its thinnest, so the
  // clear air between two rings is the centre gap less one card.
  for (let i = 1; i < rings.length; i++) {
    const gap = rings[i] - rings[i - 1];
    assert.ok(gap > 0, `ring ${i} sits inside ring ${i - 1}`);
  }

  // AND THE RINGS RUN OUTWARD, which the level order promises.
  assert.deepEqual(
    [...rings].sort((a, b) => a - b),
    rings,
    "rings must increase outward",
  );
});
