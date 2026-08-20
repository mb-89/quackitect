// A CLEAR JUMP IS ONE CALL (req-a-clear-jump-is-one-call).
//
// The requirement, from an owner ruling of 2026-08-14: name a state as the
// target, ask in the SAME call to be taken there, and if nothing between the
// walk and that state is owed, the engine lands the walk on it within that one
// call and answers that it arrived.
//
// THE SECOND HALF IS WHAT THE DEFECT NEEDED. A sweep that runs past its
// caller's timeout is CUT OFF mid-hop, and the next pull then computes from a
// position the machine disagrees with — `completeState: <state> is not
// active`, eight times across two sessions (note-c76d90e3c17a). The sweep is
// now bounded in time and checks the bound BETWEEN hops, where the walk always
// stands on a whole state.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, creditReading, freshRoot } from "./helpers.ts";

/** Boot to idle with BOTH proofs in hand.
 *
 *  The human's proof is checkDocs. The AGENT's is earned by reading through
 *  the lane: `.se/reading.md` IS the reading, and reading it credits every
 *  document it carries.
 *
 *  IT IS READ PAGED, NOT WHOLE (i6). One whole-file read worked until the
 *  guidance corpus crossed the read cap on 2026-08-16 — 120,452 characters
 *  against 120,000. Every read was then refused, nothing was credited, and
 *  these cases failed pointing at front_desk while having nothing to do with
 *  front_desk.
 *
 *  Both are needed here because a sweep on the agent channel weighs the
 *  agent's reading, and boot alone leaves that owed. */
async function bootBoth(): Promise<{ s: Session; server: ReturnType<typeof buildServer> }> {
  const root = freshRoot();
  const s = new Session(root);
  checkDocs(s);
  for (let i = 0; i < 10; i++) {
    if (s.active()[0] === "idle") break;
    await s.advance();
  }
  assert.equal(s.active()[0], "idle", "boot did not reach idle");

  const server = buildServer(root, s);
  await creditReading(server, call);
  return { s, server };
}

describe("a clear jump is one call", { concurrency: true }, () => {
  test("aiming ALONE still moves nothing — a target says where, never goes", async () => {
    const { s, server } = await bootBoth();
    const before = s.active();

    await call(server, "se_aim", { to: "front_desk" });

    assert.deepEqual(s.active(), before, "aiming is not walking, and that law is unchanged");
  });

  test("aim with go LANDS the walk in the same call and answers that it arrived", async () => {
    const { s, server } = await bootBoth();

    const r = await call(server, "se_aim", { to: "front_desk", go: true });
    const body = r.body as { arrived?: boolean; swept?: string[]; note?: string };

    assert.equal(body.arrived, true, `nothing was owed on the way, so one call is enough — got ${body.note ?? "no note"}`);
    assert.ok((body.swept ?? []).length > 0, "it WALKED, rather than only pointing at the target");
    assert.equal(s.active()[0], "front_desk", "and the walk really stands there afterwards");
  });

  test("the sweep stops ON A STATE at its budget, never cut off between two", async () => {
    const { s } = await bootBoth();

    // A zero budget stops it after the FIRST whole hop. The guard is checked
    // between hops on purpose: that is the only moment the walk stands on one
    // state with nothing half-applied.
    const out = (await s.sweep("front_desk", "agent", 0)) as { swept?: string[]; arrived?: boolean; note?: string };

    // THE INVARIANT, not the hop count: however far it got, it ANSWERED and
    // the walk stands on ONE whole state. Being cut off is what leaves it
    // between two, and that is what this budget exists to prevent.
    assert.ok((out.swept ?? []).length >= 1, `it walked at least one whole hop before answering — ${out.note ?? ""}`);
    assert.equal(s.active().length, 1, "the walk stands on ONE state, never between two");
  });

  test("a sweep stopped at its budget resumes and arrives — nothing is lost", async () => {
    const { s } = await bootBoth();

    await s.sweep("front_desk", "agent", 0);
    // The route recomputes from wherever the first sweep stopped, so a second
    // one carries on rather than starting over.
    const again = (await s.sweep("front_desk", "agent")) as { arrived?: boolean; note?: string };

    assert.equal(again.arrived, true, `the route recomputes from where it stopped — ${again.note ?? ""}`);
    assert.equal(s.active()[0], "front_desk");
  });
});
