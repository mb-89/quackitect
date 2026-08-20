// i6's ripple demand, written before the build so it is watched failing.
//
// LIVED 2026-08-16, in this iteration: a value outside its vocabulary trapped
// the walk for ELEVEN calls, four states later. The refusal named the first
// hop every time, so three amends were aimed at states that were fine. se_why
// found it in two calls, because se_why already walked the chain.
//
// req-a-ripple-names-its-root
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fallenChain, type MachineDecl, type StateDecl } from "../engine/machine.ts";

/** A claim-bearing state feeding the named ones. One evidence field is all it
 *  takes to be claimful, which is the only property this walk reads. */
function state(id: string, to: string[], claimful = true): StateDecl {
  return {
    id,
    kind: "work",
    statement: "",
    guidance: "",
    evidence_form: claimful ? [{ name: "built", description: "", required: true }] : [],
    priority: 0.2,
    edges: to.map((t) => ({ to: t, role: "normal" as const })),
  } as StateDecl;
}

/** a -> b -> c -> d, a straight chain of four claim-bearing states. */
const CHAIN: MachineDecl = {
  id: "fixture",
  states: [state("a", ["b"]), state("b", ["c"]), state("c", ["d"]), state("d", [])],
} as MachineDecl;

const CLAIMFUL = new Set(["a", "b", "c", "d"]);

test("the chain walks past the first hop to the state that actually fell", () => {
  // Nothing is done. Asked about d, the first hop is c — and the work is at a.
  const { roots } = fallenChain(CHAIN, "d", new Set(), CLAIMFUL);
  assert.deepEqual(roots, ["a"], "the root is where no input of its own has fallen");
});

test("the path comes back root first, so the reader sees how far away it is", () => {
  const { path } = fallenChain(CHAIN, "d", new Set(), CLAIMFUL);
  assert.deepEqual(path, ["a", "b", "c", "d"], "root, then every waiting state, then the one that asked");
});

test("a root that is already done is not a root", () => {
  // `a` stands. The chain now starts at b.
  const { roots, path } = fallenChain(CHAIN, "d", new Set(["a"]), CLAIMFUL);
  assert.deepEqual(roots, ["b"], "the first state above the standing ground");
  assert.deepEqual(path, ["b", "c", "d"]);
});

test("nothing fallen upstream leaves no root at all", () => {
  const { roots, path } = fallenChain(CHAIN, "d", new Set(["a", "b", "c"]), CLAIMFUL);
  assert.deepEqual(roots, [], "d's inputs all stand — the work is at d itself");
  assert.deepEqual(path, []);
});

test("two independent chains both name their own root", () => {
  // e and f both feed g, from separate origins.
  const forked: MachineDecl = {
    id: "fixture",
    states: [state("e0", ["e1"]), state("e1", ["g"]), state("f0", ["f1"]), state("f1", ["g"]), state("g", [])],
  } as MachineDecl;
  const { roots } = fallenChain(forked, "g", new Set(), new Set(["e0", "e1", "f0", "f1", "g"]));
  assert.deepEqual(roots.slice().sort(), ["e0", "f0"], "each branch is reported, not just the first found");
});

// A CYCLE HAS NO ROOT, and reporting nothing would be worse than reporting the
// first hop. The walk must terminate and say so rather than spin.
test("a cycle returns no root instead of spinning", () => {
  const looped: MachineDecl = {
    id: "fixture",
    states: [state("x", ["y"]), state("y", ["x"]), state("y2", ["z"]), state("z", [])],
  } as MachineDecl;
  // z is fed by y2, which is fed by nothing — so z has a root. x and y feed
  // only each other, and asking either must still terminate.
  const { roots } = fallenChain(looped, "x", new Set(), new Set(["x", "y", "y2", "z"]));
  assert.deepEqual(roots, [], "no state in the cycle has an un-fallen input, so none is a root");
});

// TRANSPARENT STATES ARE LOOKED THROUGH. `start` and plain waypoints carry no
// evidence form, so they can never be green — gating on them would grey the
// whole machine, and treating one as a root would point the reader at a state
// with nothing to fix.
test("a state with no claim of its own is never named as the root", () => {
  const throughStart: MachineDecl = {
    id: "fixture",
    states: [state("start", ["a"], false), state("a", ["b"]), state("b", [])],
  } as MachineDecl;
  const { roots } = fallenChain(throughStart, "b", new Set(), new Set(["a", "b"]));
  assert.deepEqual(roots, ["a"], "start carries no claim, so a is where the chain begins");
});
