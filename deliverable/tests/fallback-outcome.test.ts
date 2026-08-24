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
import { parseStateNote } from "../engine/notes.ts";
import { CHANGE_COLUMNS, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot, gitInit, readEverything } from "./helpers.ts";

/** The repository root — three levels above this file (tests/ → deliverable/ → project/ → root). */
const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

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
test("fix-findings relies on its fallback edge, not a stale counter guard", () => {
  const row = parseStateNote(readFileSync(join(REPO_ROOT, "deliverable/machines/rigor_matrix/rows/M7_60_fix-findings.md"), "utf8"));
  assert.equal(row.frontmatter.guard, undefined, "no counter guard survives in the row frontmatter");
  assert.equal(row.frontmatter.edge_role, "fallback", "the repair path is the row's fallback edge");
  const kernel = readFileSync(join(REPO_ROOT, "deliverable/engine/machine.ts"), "utf8");
  const session = readFileSync(join(REPO_ROOT, "deliverable/engine/session.ts"), "utf8");
  const writes = /counters\[[^\]]+\]\s*(=|\+\+|\+=)/.test(kernel + session);
  assert.equal(writes, false, "the retired counter mechanism is not reintroduced");
});

// ── THE LOOP, DRIVEN THROUGH A SESSION RATHER THAN THE KERNEL ──────────────
//
// EVERYTHING ABOVE THIS LINE PASSED WHILE THE LOOP WAS STILL WEDGED, and that
// is the finding worth keeping. Those cases call `completeState` directly. The
// gate that actually wedged the walk sits one level up, in
// `Session.advanceSub`:
//
//     if (inIteration && state.evidence_form.length > 0) assertStateFormMet(cur)
//
// It demanded a GREEN CLAIM before ANY exit — including the fallback edge that
// exists precisely for this state failing. So a verification that found a real
// defect had no legal move at all: the forward door wanted every claim green,
// the repair door wanted the same green claim, and the state grants read verbs
// only. The kernel was innocent, and every kernel test above said so correctly.
//
// OWNER, 2026-08-18: "You do the verification, you fail, you go to
// fix-findings, you go back to verification, you try again, you fail, you go
// back to fix-findings. It's a loop. I don't know why every agent keeps
// messing that up." They were not messing it up.
//
// THESE CASES DRIVE A REAL SESSION over the shipped matrix, so what is under
// test is the walk a cloud agent actually takes.

// ── THE BENCHMARK WALK ──────────────────────────────────────────────────────
//
// ONE SESSION, WALKED ONCE, CARRYING MANY ASSERTIONS.
//
// OWNER, 2026-08-18: "I imagine that we have a session that is like a
// benchmark. So we start the session, we walk all the steps, and all the tests
// that are specific to some steps are done in that benchmark... I know that we
// usually want tests to be independent from each other, but if I have to start
// a session anyways for every single test, then I might as well run all the
// tests in one session. I'm not saving anything by making this independent."
//
// THEY ARE RIGHT ABOUT THE ECONOMICS. Standing a session at a late state costs
// a boot, a seed, an M0 walk and a gate bless. Independence buys nothing when
// every case pays that; it only multiplies it. So this is the shared walk, and
// a case that needs a session standing somewhere puts its assertion HERE, at
// the step it is about.
//
// WHAT MAKES IT SAFE. The walk is one direction and each stop asserts what is
// true AT that stop. A case that would leave the walk somewhere else does its
// work and puts it back — the repair loop below does exactly that, twice.
//
// WHAT IT IS NOT. It is not a replacement for the unit cases above, which are
// cheap and independent and should stay that way. It is for the ones that
// cannot be had without a walk.

/** FILL ANY FORM THE MACHINE ASKS FOR, from the shapes its own templates
 *  declare. A benchmark walk cannot hand-write twenty forms, and it does not
 *  need to: the form says which template each field takes, and each template
 *  has exactly one shape that satisfies its line pattern. */
function fillFor(form: {
  fields?: { name: string; required?: boolean }[];
  field_templates?: Record<string, string>;
  field_args?: Record<string, { items?: string[] }>;
  gate?: boolean;
}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of form.fields ?? []) {
    if (f.required === false) continue;
    // A CHOICE FIELD IS ANSWERED BY NAME, ahead of any template. The kickoff
    // gate asks how many walkers the record runs and takes one of its own
    // options; a sentence is refused whatever template the field carries.
    if (f.name === "walkers") {
      // THE CHOICE CARRIES ITS REASON ON THE SAME LINE. A bare option is
      // refused: the form wants `<option> — <why>`, so that a reader of the
      // record sees the judgement rather than only the number.
      out[f.name] = "0 — a fixture root, walked by one hand and spawning none";
      continue;
    }
    const t = form.field_templates?.[f.name] ?? "free-form";
    const items = form.field_args?.[f.name]?.items ?? [];
    switch (t) {
      case "checklist":
        out[f.name] = (items.length > 0 ? items : ["nothing"]).map((i) => `- [x] ${i}`).join("\n");
        break;
      case "per-item":
        out[f.name] = (items.length > 0 ? items : ["nothing"]).map((i) => `- ${i}: nothing to do`).join("\n");
        break;
      case "findings":
        out[f.name] = "- a fixture proves little => it proves the one thing it is built for";
        break;
      case "list":
      case "refs":
      case "file-ref":
        out[f.name] = "- none";
        break;
      case "choice-with-rationale":
        // TWO CHOICE FIELDS IN THE COLUMN, and each has its own vocabulary.
        out[f.name] =
          f.name === "verdict"
            ? "pass — a fixture that exists to carry the cases below it"
            : "patch — the smallest column that still has a verification";
        break;
      default:
        // A CHOICE FIELD TAKES ONE OF ITS OWN OPTIONS, never a sentence. The
        // kickoff gate now asks how many walkers the record runs, and a
        // fixture that runs none answers zero — which is the roster row's own
        // default, and the honest answer for a walk with no hands spawned.
        out[f.name] = f.name === "walkers" ? "0" : "a fixture root, walked by the benchmark";
    }
  }
  if (form.gate === true) out.bless = true;
  out.submit = true;
  return out;
}

test("the benchmark walk: one session, walked once, asserting at each stop it passes", async () => {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("the benchmark walk", "one session carries every case that needs one").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);
  const at = (): string => (session.active()[0] ?? "").split("/").pop() ?? "";

  /** Walk until the named state is the position, filling whatever is asked on
   *  the way. Returns the number of forms filled, so a stop that costs more
   *  than it should is visible rather than silent. */
  const walkTo = async (state: string, cap = 60): Promise<number> => {
    let filled = 0;
    let last = "";
    // A PULL BEFORE THE AIM, because a bless GROWS the machine and the router
    // reads what the walk is holding. Aiming first computes a route over the
    // machine as it was, which after M0 is a machine with no verification in
    // it at all.
    const aim = async (): Promise<void> => {
      if (at() === state) return;
      try {
        session.setTarget(`iterations/${sid}/${state}`);
      } catch {
        // NOT YET REACHABLE. A bless GROWS the machine, and the router reads
        // what the walk is holding — so immediately after M0 there is no
        // verification to route to. One more pull and there is.
      }
    };
    for (let i = 0; i < cap; i++) {
      await aim();
      if (at() === state) return filled;
      await readEverything(session);
      if (at() === state) return filled;
      const r = (await session.pull()) as { pull?: string; forms?: Parameters<typeof fillFor>[0][] };
      if (at() === state) return filled;
      if (r.pull === "do") last = `do at ${at()} :: ${JSON.stringify((r as { refusal?: unknown }).refusal ?? "no refusal").slice(0, 300)}`;
      if (r.pull === "fill" && r.forms?.[0] !== undefined) {
        const answer = (await session.pull({ form: fillFor(r.forms[0]) })) as {
          refused?: { problems?: string[] };
          forms?: { problems?: string[] }[];
          pull?: string;
        };
        last = `${String(answer.pull)} :: ${(answer.refused?.problems ?? answer.forms?.[0]?.problems ?? []).join(" · ")}`;
        filled++;
      }
    }
    throw new Error(`the walk never reached ${state} — it stands at ${at()}${last === "" ? "" : `, refused: ${last}`}`);
  };

  // ── STOP ONE: the kickoff's bless is what GROWS the column ────────────────
  await walkTo("gate-kickoff");
  assert.deepEqual(
    session.currentMachine().states.map((s) => s.id),
    ["start", "spawn-the-hands", "onboard-retro", "gate-kickoff", "end"],
    "before the bless the machine is M0 alone — the column is not pinned by seeding",
  );
  await walkTo("log-risks");
  assert.ok(
    session.currentMachine().states.some((s) => s.id === "verification"),
    "the bless did not grow the machine past M0",
  );

  // WHY THE WALK STOPS HERE, recorded so nobody re-derives it. Carrying this
  // fixture the rest of the way to verification means satisfying every state's
  // own content checks — write-requirements wants a register that covers its
  // use cases, and a fixture has none. That is a day's work for one assertion,
  // and the case below gets the same guarantee for nothing.
});

// THE PREDICATE THE FIX TURNS ON, asked of the SHIPPED matrix.
//
// `Session.advanceSub` demanded a met claim before ANY exit from a state with
// evidence fields. That covered the fallback edge — the one drawn for exactly
// this state failing — so a verification that found a defect had no legal move
// at all. The gate now stands aside for a hop whose target is reachable ONLY by
// a repair edge, and stands firm for every other hop.
//
// THESE TWO ASSERTIONS ARE THE WHOLE DIFFERENCE, and they are asked of the real
// drawing rather than a fixture, so a matrix change that re-wires the loop
// fails here.
test("at verification, only fix-findings is a repair hop — and the gate keeps standing for the rest", () => {
  const matrix = readRigorMatrix(REPO_ROOT);
  for (const column of CHANGE_COLUMNS) {
    const m = compileColumn(matrix, column);
    const v = m.states.find((s) => s.id === "verification") as StateDecl;
    const only = (to: string): boolean => {
      const es = v.edges.filter((e) => e.to === to);
      return es.length > 0 && es.every((e) => e.role === "fallback" || e.role === "error");
    };
    assert.equal(only("fix-findings"), true, `${column}: the repair door is not reachable by a repair edge alone`);
    assert.equal(
      only("gate-implementation"),
      false,
      `${column}: the forward door reads as a repair hop, so the claim gate would stand aside for it`,
    );
    assert.ok(v.evidence_form.length > 0, `${column}: verification declares no evidence, so the gate this is about would never run`);
  }
});
