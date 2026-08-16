// A FALLBACK EDGE IS THE DRAWN PATH FOR THE THING GOING WRONG, and until i6
// it could never fire.
//
// `completeState` picks which edges fire from the OUTCOME: filled gives
// normal, alternative, approval and recovery; anything else gives fallback and
// error. Every hop completed "filled", so no fallback edge in any machine had
// ever fired.
//
// FOUND LIVE 2026-08-16. verification's exit script runs the battery; its
// fallback is fix-findings, "Fix the battery's findings: all of them, in one
// pass". The battery came back red, the forward door stayed shut on the
// condition, and the repair door never opened — the walk stood in a state
// granting read verbs only, with no legal move.
//
// AND WALKING ON IS NOT PASSING (owner ruling 2026-08-16: "if we complete on
// failed outcome, then it must be marked red"). settledStates counts a state
// green only where its LATEST history outcome is "filled".
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { completeState, type MachineDecl, type StateDecl, settledStates } from "../engine/machine.ts";

function state(id: string, edges: { to: string; role: "normal" | "fallback" }[], kind: StateDecl["kind"] = "work"): StateDecl {
  return { id, kind, statement: "", guidance: "", evidence_form: [], priority: 0.2, edges } as StateDecl;
}

/** work → forward on normal, → repair on fallback. The shape verification and
 *  fix-findings actually have. */
function machine(): MachineDecl {
  return {
    id: "fixture",
    reentry: "resume",
    initial: "work",
    states: [
      state("work", [
        { to: "forward", role: "normal" },
        { to: "repair", role: "fallback" },
      ]),
      state("forward", []),
      state("repair", []),
    ],
  } as MachineDecl;
}

function instance(): { current: string; active: string[]; history: { state: string; outcome: string; at: string }[]; status: string } {
  return { current: "work", active: ["work"], history: [], status: "open" };
}

test("a filled completion takes the forward edge and never the fallback", () => {
  const m = machine();
  const inst = instance() as never;
  completeState(m, inst, "work", "filled", "now");
  const active = (inst as unknown as { active: string[] }).active;
  assert.ok(!active.includes("repair"), `the repair door stays shut on a good run: ${JSON.stringify(active)}`);
});

test("a failed completion opens the fallback, which is what makes it reachable at all", () => {
  const m = machine();
  const inst = instance() as never;
  completeState(m, inst, "work", "failed", "now");
  const active = (inst as unknown as { active: string[] }).active;
  assert.ok(active.includes("repair"), `the drawn repair path opens: ${JSON.stringify(active)}`);
  assert.ok(!active.includes("forward"), "and the forward edge does not fire — a red run may not walk on");
});

// THE HALF THE OWNER NAMED. Completing is not passing: the state that failed
// must not read green afterwards, or the walk would launder a red into a
// signed claim by taking its own repair door.
test("the state that took the fallback reads RED, never green", () => {
  const m = machine();
  const inst = instance() as never;
  completeState(m, inst, "work", "failed", "now");
  (inst as unknown as { history: { state: string; outcome: string; at: string }[] }).history.push({
    state: "work",
    outcome: "failed",
    at: "now",
  });

  const green = settledStates(inst as unknown as Parameters<typeof settledStates>[0]);
  assert.ok(!green.has("work"), `a failed completion is not green: ${JSON.stringify([...green])}`);
});

test("the same state completing filled DOES read green, so the test above is not vacuous", () => {
  const m = machine();
  const inst = instance() as never;
  completeState(m, inst, "work", "filled", "now");
  (inst as unknown as { history: { state: string; outcome: string; at: string }[] }).history.push({
    state: "work",
    outcome: "filled",
    at: "now",
  });

  const green = settledStates(inst as unknown as Parameters<typeof settledStates>[0]);
  assert.ok(green.has("work"), "a filled completion is green, which is what makes the failed case mean something");
});
