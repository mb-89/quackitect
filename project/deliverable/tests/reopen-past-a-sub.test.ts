// A RE-SIGN CASCADE MUST NOT DEAD-END ON A STATE THAT RUNS A SUB-MACHINE.
//
// MEASURED ON i38, 2026-08-20, at iterations/i38/run-demos/end. verification
// was re-signed, which dropped gate-implementation. The blocker named that
// gate as the chain root and handed over the exact se_reopen call. Re-signing
// it dropped run-demos, whose sub-machine had already been walked — and there
// the walk stopped for good.
//
// WHY IT COULD NOT MOVE. A state's own form is served only while the walk
// stands ON it with its sub unseeded. Once the sub is seeded the leaf is
// inside it, and the lookup read the LEAF alone: a sub's start, end and join
// are machinery, machinery never signs, so the answer was "nothing is owed".
// Leaving the sub runs the parent's claim guard, the guard wants the claim,
// the claim wants the form, and the form was unreachable. Nothing the agent
// or the person could press moved it.
//
// THE END-TO-END WALK IS NOT ASSERTED HERE, AND THAT IS SAID RATHER THAN
// HIDDEN. Standing a fixture inside a seeded sub-machine at its end, with the
// parent reopened, means walking a whole iteration first. What this file holds
// instead is the decision itself, and a check that the walk's own lookup still
// routes through it — so deleting the ascent goes red rather than silent.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { formBearer } from "../engine/sessionclaims.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const CLAIMS = readFileSync(join(HERE, "..", "engine", "sessionclaims.ts"), "utf8");

function state(id: string, kind: string): Parameters<typeof formBearer>[0] {
  return { id, kind } as unknown as Parameters<typeof formBearer>[0];
}

describe("a reopened claim is reachable from inside the sub it runs", () => {
  test("a work leaf answers for itself, and the parent is not consulted", () => {
    const leaf = state("run-spikes", "work");
    assert.equal(formBearer(leaf, state("elsewhere", "work"), true)?.id, "run-spikes");
  });

  test("a gate leaf answers for itself", () => {
    assert.equal(formBearer(state("gate-validation", "gate"), undefined, false)?.id, "gate-validation");
  });

  test("a sub's machinery ascends to the state that RUNS the sub", () => {
    // This is the fix. Without it the answer is undefined and the walk is
    // stuck at the end of a sub-machine it cannot leave.
    for (const machinery of ["start", "end", "join", "terminal"]) {
      const got = formBearer(state(machinery, machinery), state("run-demos", "work"), true);
      assert.equal(got?.id, "run-demos", `${machinery} did not ascend — the parent's form stays unreachable`);
    }
  });

  // THE GATE, and it is the whole difference between a fix and ten broken
  // cases. A parent that was never signed is not in a dead end: the walk got
  // into its sub legitimately, and every entry into an iteration stands at a
  // machinery leaf under a container state that has never signed.
  test("a parent whose claim was never sent back is not served", () => {
    assert.equal(formBearer(state("start", "start"), state("i1", "work"), false), undefined);
  });

  test("machinery outside a sub still owes nothing", () => {
    assert.equal(formBearer(state("end", "end"), undefined, true), undefined);
  });

  test("a parent that does not sign is not invented into one", () => {
    // Ascending is not a licence to serve a form for machinery one level up.
    assert.equal(formBearer(state("end", "end"), state("start", "start"), true), undefined);
  });

  test("an unknown leaf owes nothing, ascent or no ascent", () => {
    assert.equal(formBearer(undefined, undefined, true), undefined);
    assert.equal(formBearer(undefined, state("run-demos", "work"), true)?.id, "run-demos");
  });

  // THE MECHANISM CHECK. The cases above pass whether or not the walk's own
  // lookup uses them, and that is exactly the hole a red team named on this
  // iteration: four checks that could not see their mechanism deleted.
  test("the walk's standing-form lookup routes through the ascent", () => {
    const body = CLAIMS.slice(CLAIMS.indexOf("standingStateFormOwed()"));
    const fn = body.slice(0, body.indexOf("\n  /**"));
    assert.match(fn, /formBearer\(/, "standingStateFormOwed no longer asks formBearer — the ascent is bypassed");
    assert.match(fn, /subParentFrame\(\)/, "the parent frame is not passed, so machinery can only answer undefined");
    assert.match(fn, /subParentReopened\(\)/, "the ascent is ungated, and every entry into an iteration is served its container form");
    // THE SUBMIT ASKS THE SAME QUESTION. Serving the form and refusing its
    // stamp is the dead end moved one step, not removed.
    const active = CLAIMS.slice(CLAIMS.indexOf("stateFormActive(name: string"));
    assert.match(
      active.slice(0, active.indexOf("\n  assert")),
      /subParentFrame\(\)/,
      "the submit guard reads the leaf alone, so the served form cannot be stamped",
    );
    assert.doesNotMatch(
      fn,
      /kind !== "work" && s\.kind !== "gate"/,
      "the old leaf-only guard is back beside the ascent, and it returns first",
    );
  });
});
