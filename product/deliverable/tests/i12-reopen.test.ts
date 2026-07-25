// REOPEN (i12). The verdict a gate review can actually reach.
//
// This file exists because reopen shipped with NO tests. It was built, it was
// promoted to trunk, and the first time it was used in anger it DEADLOCKED the
// machine: reopening one state made a downstream AND-join permanently
// unreachable, with no error and no legal move. The walk simply stopped, and
// looked like it was waiting for something.
//
// The lesson is the same one this whole iteration is about — the mechanism
// nobody asked a question of is the mechanism that is broken.
import { test } from "node:test";
import assert from "node:assert/strict";
import { completeState, reopenStates, type MachineDecl, type MachineInstance } from "../engine/machine.ts";

/**
 * A join fed from two directions, which is the shape the real machine uses and
 * the shape that broke:
 *
 *     left  ─────────────┐
 *                        ├──> join ──> done
 *     up ──> mid ────────┘
 *
 * `join` requires BOTH inbound edges. Reopening `up` re-walks the right-hand
 * arm while `left` stays legitimately done.
 */
function machine(): MachineDecl {
  const state = (id: string, edges: { to: string; role: "normal" }[], kind: "work" | "gate" | "terminal" = "work") => ({
    id,
    kind,
    statement: id,
    filled_by: "agent" as const,
    guidance: "",
    evidence_form: [],
    edges,
  });
  return {
    id: "join-fixture",
    reentry: "restart",
    initial: "left",
    states: [
      state("left", [{ to: "join", role: "normal" }]),
      state("up", [{ to: "mid", role: "normal" }]),
      state("mid", [{ to: "join", role: "normal" }]),
      state("join", [{ to: "done", role: "normal" }], "gate"),
      state("done", [], "terminal"),
    ],
  };
}

function instance(): MachineInstance {
  return {
    machine: "join-fixture",
    iteration: "it",
    current: "left",
    active: ["left", "up"],
    fired: [],
    counters: {},
    history: [],
    escapes: [],
    status: "open",
  };
}

const fill = (m: MachineDecl, inst: MachineInstance, id: string): void => {
  completeState(m, inst, id, "filled", "t");
  inst.history.push({ state: id, outcome: "filled", evidence: `${id}.json`, at: "t" });
};

test("reopening one arm of a join leaves the join REACHABLE", () => {
  const m = machine();
  const inst = instance();

  fill(m, inst, "left");
  fill(m, inst, "up");
  fill(m, inst, "mid");
  assert.deepEqual(inst.active, ["join"], "both arms done, so the join activated");

  // Now the gate reviews itself and sends the right-hand arm back.
  reopenStates(m, inst, ["up"], "the story is missing a need", "t");
  assert.deepEqual(inst.active, ["up"]);

  // Re-walk the reopened arm. THIS is where it used to die: `left`'s fuel was
  // consumed when the join first activated, and nothing would ever produce it
  // again, so the join could not activate a second time.
  fill(m, inst, "up");
  fill(m, inst, "mid");
  assert.deepEqual(inst.active, ["join"], "the join must re-activate — a reopen that strands the gate is worse than no reopen");
  assert.equal(inst.current, "join");
});

test("re-armed fuel comes only from states that are still DONE", () => {
  const m = machine();
  const inst = instance();
  fill(m, inst, "left");
  fill(m, inst, "up");
  fill(m, inst, "mid");

  // Reopen BOTH arms. `left` is now inside the cone and being re-walked, so
  // putting its fuel back would let the join fire on an arm that has not been
  // done — the exact stale-fuel bug the un-firing rule exists to prevent.
  reopenStates(m, inst, ["left", "up"], "both arms", "t");
  assert.deepEqual(inst.fired, [], "nothing is pre-fired when every source is being re-walked");

  fill(m, inst, "up");
  fill(m, inst, "mid");
  assert.equal(inst.active?.includes("join"), false, "the join must WAIT for the left arm it has not seen yet");
  fill(m, inst, "left");
  assert.equal(inst.active?.includes("join"), true, "and activate once both arms really are done");
});

test("a reopen supersedes prior fills and keeps them readable", () => {
  const m = machine();
  const inst = instance();
  fill(m, inst, "left");
  fill(m, inst, "up");
  fill(m, inst, "mid");

  const r = reopenStates(m, inst, ["up"], "because the review said so", "t");

  assert.equal(r.superseded, 2, "up and mid were in the cone; left was not");
  const up = inst.history.filter((h) => h.state === "up");
  assert.equal(up[0].outcome, "superseded", "the first fill is not deleted");
  assert.equal(up[0].evidence, "up.json", "and it still points at its evidence — a reader must be able to open what was claimed");
  assert.equal(inst.history.filter((h) => h.state === "left")[0].outcome, "filled", "work outside the cone is untouched");

  const marker = inst.history.find((h) => h.outcome === "reopened");
  assert.ok(marker, "the reopen itself is in the record");
  assert.match(String(marker?.evidence), /because the review said so/, "carrying the reason in the ordering party's words");
});

test("reopening an undeclared state is refused rather than silently ignored", () => {
  const m = machine();
  const inst = instance();
  assert.throws(() => reopenStates(m, inst, ["no_such_state"], "typo", "t"), /undeclared state/);
});
