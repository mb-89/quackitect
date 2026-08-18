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
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { activeStates, completeState, type MachineDecl, type MachineInstance, type StateDecl, settledStates } from "../engine/machine.ts";
import { CHANGE_COLUMNS, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

/** The repository root — three levels above this file (tests/ → deliverable/ → project/ → root). */
const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

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

// THE LOOP THE FIELD REPORT SAID WAS WEDGED, driven on the SHIPPED matrix
// rather than a fixture (i35, 2026-08-17).
//
// The i15 cloud run stopped at verification with SE-C-123 and the report
// offered two causes: either the compiler adds inbound edges the row does
// not declare, or it does not honour `edge_role: fallback`. BOTH ARE
// REFUTED HERE, on every column, by asking the compiler directly — so the
// wedge was never in the drawing, and looking there again would cost
// another afternoon.
//
// THIS IS THE TEST THE RECORD ASKED FOR: the case is driven, so a change
// that re-breaks the fallback loop fails here instead of on a cloud box
// nobody is watching.
test("the shipped matrix wires verification's fallback loop, and the loop walks — every column", () => {
  const matrix = readRigorMatrix(REPO_ROOT);
  for (const column of CHANGE_COLUMNS) {
    const m = compileColumn(matrix, column);
    const at = (id: string): StateDecl => m.states.find((s) => s.id === id) as StateDecl;
    const inbound = (id: string) => m.states.flatMap((s) => s.edges.filter((e) => e.to === id).map((e) => `${s.id}:${e.role}`));

    // THE ROW DECLARES ONE INBOUND DEPENDENCY AND THE COMPILER ADDS NONE.
    assert.deepEqual(inbound("fix-findings"), ["verification:fallback"], `${column}: fix-findings has exactly one inbound, the fallback`);
    // AND edge_role: fallback IS honoured — it also closes the recovery edge.
    assert.deepEqual(
      at("fix-findings").edges.map((e) => `${e.to}:${e.role}`),
      ["verification:recovery"],
      `${column}: fix-findings returns by the recovery edge and nothing else`,
    );

    // Everything above verification stands green; this walk is about the
    // three states below it and nothing else.
    const below = new Set(["verification", "fix-findings", "gate-implementation"]);
    const green = new Set(m.states.map((s) => s.id).filter((id) => !below.has(id)));
    const inst = {
      id: "i35",
      machine: m.id,
      current: "verification",
      status: "open",
      active: ["verification"],
      fired: [],
      counters: {},
      escapes: [],
      history: [],
    } as unknown as MachineInstance;
    const hop = (from: string, to: string, outcome: "filled" | "failed") => {
      completeState(m, inst, from, outcome, "now", to, () => green);
      return activeStates(inst);
    };

    // TWO RED ROUNDS, because one round can pass on fuel that a second has
    // already spent — which is the shape every join bug in this kernel took.
    for (const round of [1, 2]) {
      assert.deepEqual(
        hop("verification", "fix-findings", "failed"),
        ["fix-findings"],
        `${column} round ${round}: a red battery opens the repair door`,
      );
      assert.deepEqual(
        hop("fix-findings", "verification", "filled"),
        ["verification"],
        `${column} round ${round}: the recovery edge returns to verification`,
      );
    }
    assert.deepEqual(
      hop("verification", "gate-implementation", "filled"),
      ["gate-implementation"],
      `${column}: a green battery walks forward`,
    );
    assert.equal(inst.status, "open", `${column}: the walk is still open — nothing wedged`);
  }
});

// THE GUARD ON THAT FALLBACK IS WIRED TO A COUNTER NOTHING WRITES.
//
// M7_60_fix-findings.md carries `guard: verification_attempts < 3` and its
// prose promises "the machine escapes to a human when the guard exhausts".
// MEASURED 2026-08-17: `counters` is initialised to {} in session.ts, carried
// across a repin, read by evalGuard — and assigned nowhere. The name
// `verification_attempts` does not occur in the engine at all.
//
// SO THE ESCAPE CAN NEVER FIRE, and the loop above is unbounded. This test
// PINS THE PROMISE RATHER THAN THE BUG: it fails the day somebody starts
// counting, which is the day the promise becomes true and the escape path
// below it has to exist. Raising the counter without an escape edge turns
// the fourth red battery into the SE-C-123 wedge this file exists to prevent.
test("the fix-findings guard names a counter, and nothing in the engine writes one", () => {
  const row = readFileSync(join(REPO_ROOT, "project/deliverable/machines/rigor_matrix/rows/M7_60_fix-findings.md"), "utf8");
  assert.match(row, /guard: verification_attempts < 3/, "the row still guards the fallback on a counter");
  const kernel = readFileSync(join(REPO_ROOT, "project/deliverable/engine/machine.ts"), "utf8");
  const session = readFileSync(join(REPO_ROOT, "project/deliverable/engine/session.ts"), "utf8");
  const writes = /counters\[[^\]]+\]\s*(=|\+\+|\+=)/.test(kernel + session);
  assert.equal(writes, false, "nothing writes a counter yet — when this fails, give the exhausted guard an escape edge before landing it");
});
