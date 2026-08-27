// A GATE IS NOT BLESSED WHILE ANYTHING INSIDE THE RECORD IS STILL OPEN.
//
// A RECORD CANNOT CLOSE OVER WORK IT NEVER FINISHED. Verification does not
// pass while a token stands open at fix-findings, and that is mechanical rather
// than a matter of anybody remembering.
//
// THE HOLE HAD TWO HALVES, and each on its own is enough to let a walk through.
//
// PER STATE IS NOT PER RECORD. A state's own open work holds that state, and
// nothing asked whether an EARLIER state was still holding something when the
// gate came round.
//
// AND EMERGENCY LIFTED THE LOT. With it armed the walk reached the gate over
// ten open tokens, and the person caught it from outside rather than the engine
// catching it from inside.
//
// THREE DOORS REACH THE THUMB — the pull's fill, the surface's evidence post
// and the mirror's own route — so the rule lives on the one method all three
// now call. A guard on two of three is the third one letting the walk through.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { type MintDemand, mint, settle } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-01-01T00:00:00Z";

function demand(statement: string): MintDemand {
  return { source: "hand", source_ref: `hand/${statement}`, step: "", statement };
}

/** A session standing at an iteration's kickoff gate, with its form filled and
 *  stamped, so the only thing left is the thumb. */
async function atTheGate(): Promise<{ session: Session; home: string; record: string }> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("hold the gate", "open work refuses the thumb").seeded);
  pinIteration(root, itFind(root, id), "major");
  session.iterationOpen(id);
  return { session, home: session.workHome(), record: `iterations/${id}` };
}

describe("open work inside a record refuses the gate's thumb", () => {
  // THE CASE THAT WAS WATCHED FAILING. Work stands at one state, and the gate
  // is a different state entirely.
  test("work at another state in the record refuses the bless", async () => {
    const { session, home, record } = await atTheGate();

    mint(home, `${record}/fix-findings`, [demand("One pull walks through")], NOW);

    assert.throws(
      () => session.formBless("gate-kickoff", true, "human"),
      (e: unknown) => {
        const said = JSON.stringify(e);
        assert.match(said, /settled or moved on before gate-kickoff is blessed/, "the refusal says what it wanted");
        assert.match(said, /One pull walks through/, "and names the work, not only a count");
        return true;
      },
    );
  });

  // EMERGENCY LIFTS EVERY OTHER WORK HOLD AND NOT THIS ONE. It is the half the
  // walk actually went through, so it is the half that needs its own case.
  test("emergency does not lift it", async () => {
    const { session, home, record } = await atTheGate();
    session.setEmergency(true);

    mint(home, `${record}/fix-findings`, [demand("Open work holds record")], NOW);

    assert.throws(() => session.formBless("gate-kickoff", true, "human"), /Open work holds record/);
  });

  // SETTLING IT OPENS THE GATE AGAIN. Without this the case above would pass
  // against a gate that simply never blesses.
  test("settling the work lets the thumb through", async () => {
    const { session, home, record } = await atTheGate();
    const made = mint(home, `${record}/fix-findings`, [demand("One pull walks through")], NOW).minted[0];
    assert.throws(() => session.formBless("gate-kickoff", true, "human"));

    settle(home, made.id, "done", { reason: "it landed", now: NOW });

    // WHATEVER STOPS IT NOW IS NOT THIS RULE. The gate has its own form and its
    // own weight, and this case is only about the work hold letting go.
    try {
      session.formBless("gate-kickoff", true, "human");
    } catch (e) {
      assert.doesNotMatch(JSON.stringify(e), /settled or moved on before/, "the work no longer holds it");
    }
  });

  // THE BACKLOG IS NOT INSIDE ANY RECORD, and it holds 154 standing tokens. A
  // rule that swept it in would mean no gate ever blesses again.
  test("the backlog does not hold a gate", async () => {
    const { session, home } = await atTheGate();

    mint(home, "backlog", [demand("Something nobody has placed yet")], NOW);

    try {
      session.formBless("gate-kickoff", true, "human");
    } catch (e) {
      assert.doesNotMatch(JSON.stringify(e), /Something nobody has placed yet/, "the backlog is outside the record");
    }
  });
});
