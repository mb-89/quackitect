// A GREEN OVER OWED WORK IS ILLEGAL, and this is where that is enforced.
//
// see dsp-mirror-render.md#green-is-refused-over-owed-work
// see dsp-mirror-render.md#downstream-loses-its-green-too
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import type { MachineDecl, StateDecl } from "../engine/machine.ts";
import { renderMirror, type StateMeta } from "../engine/render.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { Session } from "../engine/session.ts";
import { owesBlocking, statePaint, withDownstream } from "../engine/viewmodel.ts";
import { type MintDemand, mint } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

/** The smallest machine that can carry the question: a chain of four, with a
 *  loop back so the walk has something to get stuck in. */
function chain(): MachineDecl {
  const to = (id: string): StateDecl["edges"] => [{ to: id, role: "normal" }];
  const state = (id: string, edges: StateDecl["edges"]): StateDecl =>
    ({ id, kind: "work", statement: id, guidance: "", evidence_form: [], edges }) as unknown as StateDecl;
  return {
    id: "m",
    states: [
      state("build", to("trace")),
      state("trace", to("verify")),
      state("verify", to("gate")),
      // THE LOOP. A gate that sends work back is the ordinary shape, and a
      // forward walk that does not guard against it never returns.
      state("gate", [
        { to: "build", role: "normal" },
        { to: "end", role: "normal" },
      ]),
      state("end", []),
    ],
  } as unknown as MachineDecl;
}

/** The same four states with the loop cut, so upstream and downstream are
 *  genuinely different sets. */
function straight(): MachineDecl {
  const decl = chain();
  const gate = decl.states.find((s) => s.id === "gate");
  if (gate !== undefined) gate.edges = gate.edges.filter((e) => e.to === "end");
  return decl;
}

function meta(over: Record<string, Partial<StateMeta>>): Record<string, StateMeta> {
  const out: Record<string, StateMeta> = {};
  for (const [id, m] of Object.entries(over)) out[id] = m as StateMeta;
  return out;
}

const ALL_DONE = new Set(["build", "trace", "verify", "gate", "end"]);
const NONE_ACTIVE = new Set<string>();

describe("green is refused over owed work", () => {
  test("a signed state holding owed work is not painted green", () => {
    const paint = statePaint("trace", NONE_ACTIVE, ALL_DONE, meta({ trace: { work_owed: true } }));

    assert.equal(paint.cls, "state owed", "the green is refused and the reason has its own class");
    assert.notEqual(paint.cls, "state done");
  });

  test("a signed state owing nothing keeps its green", () => {
    const paint = statePaint("trace", NONE_ACTIVE, ALL_DONE, meta({ trace: { work_owed: false } }));

    assert.equal(paint.cls, "state done");
  });

  test("the active colour still beats the refusal, because a state being walked is not a claim", () => {
    const paint = statePaint("trace", new Set(["trace"]), ALL_DONE, meta({ trace: { work_owed: true } }));

    assert.equal(paint.cls, "state active");
  });

  test("everything downstream of an owing state loses its green too", () => {
    const refused = withDownstream(chain(), new Set(["trace"]));

    assert.deepEqual([...refused].sort(), ["build", "end", "gate", "trace", "verify"], "the loop carries it back to build");
  });

  test("nothing upstream of an owing state is touched", () => {
    // A STRAIGHT MACHINE, because the chain's gate loops back to build — there,
    // every state really is downstream of every other and the question cannot
    // be asked.
    const refused = withDownstream(straight(), new Set(["verify"]));

    assert.ok(refused.has("verify"), "the owing state itself is in the answer");
    assert.ok(refused.has("gate"), "and what follows it");
    assert.ok(!refused.has("trace"), "but not what came before it");
    assert.ok(!refused.has("build"), "nor anything earlier still");
  });

  test("a machine with a cycle finishes rather than walking for ever", () => {
    // The chain's gate edges back to build, so an unguarded walk never returns.
    // The assertion is that this call completes at all.
    const refused = withDownstream(chain(), new Set(["build"]));

    assert.equal(refused.size, 5);
  });

  test("owing nothing refuses nothing", () => {
    assert.equal(withDownstream(chain(), new Set()).size, 0);
  });
});

// PENDING DOES NOT BLOCK, so it never takes a green away.
// see dsp-mirror-render.md#pending-is-the-one-exception
describe("which buckets take a green away", () => {
  const none = { in: 0, out: 0, below: { in: 0, out: 0 } };

  test("an input bucket blocks", () => {
    assert.equal(owesBlocking({ ...none, in: 1 }), true);
  });

  test("an output bucket blocks", () => {
    assert.equal(owesBlocking({ ...none, out: 1 }), true);
  });

  test("what a submachine owes blocks the machine above it", () => {
    assert.equal(owesBlocking({ ...none, below: { in: 0, out: 3 } }), true);
  });

  test("an empty state blocks nothing", () => {
    assert.equal(owesBlocking(none), false);
  });

  // THE PENDING COUNT IS NOT AN ARGUMENT HERE, and that is the point. It cannot
  // reach the decision, so it cannot block, whatever it holds.
  test("pending is not one of the counts the rule can see", () => {
    const withPending = { ...none, pending: 9, below: { in: 0, out: 0, pending: 9 } };

    assert.equal(owesBlocking(withPending), false);
  });
});

// THE SOURCE IS NOT THE EVIDENCE. THE SERVED PAGE IS.
//
// Every case above reads a function. None of them asks the question the reader
// asks: what does the DRAWING the server returns actually paint?
//
// see ux.md#a-drawing-change-is-not-done-until-its-output-is-measured
describe("the served drawing refuses the green", { concurrency: false }, () => {
  const NOW = "2026-08-26T10:00:00Z";

  /** An open iteration with work owed at one of its states, rendered as the
   *  server returns it. `at` is the state the work is placed on. */
  async function served(at: string): Promise<string> {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    for (let i = 0; i < 2; i++) await session.advance();
    checkDocs(session);
    for (let i = 0; i < 3; i++) await session.advance();
    session.setAutonomy(1);
    const id = String(session.iterationSeed("prove the green is refused", "a state owing work is never painted green").seeded);
    pinIteration(root, itFind(root, id), "major");
    session.iterationOpen(id);
    const demand: MintDemand = { source: "evidence", source_ref: "docs/a.md", step: "", statement: "an output", difficulty: "mechanical" };
    mint(String(session.boundRecordHome()), `iterations/${id}/${at}`, [demand], NOW);
    return renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", id);
  }

  test("work owed at a state reaches the served drawing as a pill", async () => {
    // THE REFUSAL ITSELF NEEDS A STATE THAT IS BOTH SIGNED AND OWED, which a
    // freshly opened iteration has none of — nothing in it has been signed yet.
    // So the served page proves the COUNT arrives; statePaint's own cases above
    // prove what the count then does to the colour.
    const html = await served("write-requirements");

    assert.match(html, /class="work-pill out"/, "the owed count is on the drawing");
    assert.doesNotMatch(html, /class="state done"/, "and nothing in a just-opened iteration claims a green");
  });

  test("the refusal withholds the green and strokes nothing (owner)", () => {
    // WITHHOLDING THE GREEN IS THE WHOLE MARK. A state owing work is drawn like
    // any other state: not dashed, and not recoloured. The pills already say
    // what is owed, in numbers, on the state itself.
    //
    // THIS CASE USED TO PIN THE OPPOSITE, and the rule it pinned taught a
    // vocabulary nobody asked for. It is kept rather than deleted so the
    // absence is held by a check instead of by memory.
    assert.ok(!STYLE.includes(".state.owed {"), "nothing paints a state that owes work");
    assert.ok(STYLE.includes(".state.done {"), "and the green a passing state gets still stands");
  });
});
