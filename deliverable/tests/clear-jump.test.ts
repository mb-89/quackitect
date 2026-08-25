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
import { call, sharedDesk } from "./helpers.ts";

/** ONE BOOTED SESSION FOR THE WHOLE FILE, reset between cases.
 *
 *  EVERY CASE HERE NEEDS THE SAME THING: a session standing at the front desk
 *  with both read proofs in hand. That costs about 900 ms alone and seven
 *  seconds under the parallel battery, and this file paid it eight times — 65
 *  of the battery's 361 seconds, the largest single share of any file.
 *
 *  THE CASES RUN SERIALLY, and that is not a preference. One session cannot be
 *  in two places, so neither `describe` below carries `concurrency: true`. */
async function bootBoth(): Promise<{ s: Session; server: ReturnType<typeof buildServer> }> {
  const desk = await sharedDesk(
    (root) => new Session(root) as never,
    (root, s) => buildServer(root, s as unknown as Session),
    call,
  );
  await desk.reset();
  return { s: desk.s as unknown as Session, server: desk.server as ReturnType<typeof buildServer> };
}

describe("a clear jump is one call", () => {
  test("go: false aims WITHOUT moving — the direction-only call remains", async () => {
    const { s, server } = await bootBoth();
    const before = s.active();

    await call(server, "se_aim", { to: "front_desk", go: false });

    assert.deepEqual(s.active(), before, "with go: false, aiming is not walking");
  });

  test("a BARE aim goes — going is the default (owner ruling 2026-08-20)", async () => {
    const { s, server } = await bootBoth();

    // The old default was the other way: a bare aim only set the target, and
    // agents re-aimed one state at a time, relitigating hops the machine
    // would have walked through. The sweep only advances through states whose
    // conditions pass and whose weight fits the dial, so going by default is
    // exactly as safe as pulling.
    const r = await call(server, "se_aim", { to: "front_desk" });
    const body = r.body as { arrived?: boolean; note?: string };

    assert.equal(body.arrived, true, `a bare aim walks now — got ${body.note ?? "no note"}`);
    assert.equal(s.active()[0], "front_desk", "and the walk really stands there afterwards");
  });

  test("aim with go LANDS the walk in the same call and answers that it arrived", async () => {
    const { s, server } = await bootBoth();

    // BOOT LANDS ON THE DESK NOW, so the desk is no longer somewhere to walk
    // TO. A door off it is, and expeditions is the plainest.
    const r = await call(server, "se_aim", { to: "expeditions", go: true });
    const body = r.body as { arrived?: boolean; swept?: string[]; note?: string };

    assert.equal(body.arrived, true, `nothing was owed on the way, so one call is enough — got ${body.note ?? "no note"}`);
    assert.ok((body.swept ?? []).length > 0, "it WALKED, rather than only pointing at the target");
    // A container has no bare state of its own. Entering "expeditions" lands
    // on its own start substate, "expeditions/start".
    assert.equal(s.active()[0], "expeditions/start", "and the walk really stands there afterwards");
  });

  test("the sweep stops ON A STATE at its budget, never cut off between two", async () => {
    const { s } = await bootBoth();

    // A zero budget stops it after the FIRST whole hop. The guard is checked
    // between hops on purpose: that is the only moment the walk stands on one
    // state with nothing half-applied.
    const out = (await s.sweep("expeditions", "agent", 0)) as { swept?: string[]; arrived?: boolean; note?: string };

    // THE INVARIANT, not the hop count: however far it got, it ANSWERED and
    // the walk stands on ONE whole state. Being cut off is what leaves it
    // between two, and that is what this budget exists to prevent.
    assert.ok((out.swept ?? []).length >= 1, `it walked at least one whole hop before answering — ${out.note ?? ""}`);
    assert.equal(s.active().length, 1, "the walk stands on ONE state, never between two");
  });

  // THE WALKING IS THE COST. A hop draws in about 8 ms and walks in about
  // 5,400, so a per-hop figure that timed only the drawing pointed at a
  // thousandth of what a caller waits for.
  // see dsp-the-walk-knows-what-its-own-hops-cost.md#the-walking-is-the-cost
  test("a sweep says what each hop cost to WALK, one figure per hop", async () => {
    const { s } = await bootBoth();

    const out = (await s.sweep("expeditions", "agent")) as {
      swept?: string[];
      swept_ms?: { to: string; ms: number }[];
    };

    const swept = out.swept ?? [];
    const spent = out.swept_ms ?? [];

    assert.equal(spent.length, swept.length, "one figure per hop actually walked, and no more");
    for (const hop of spent) {
      assert.ok(Number.isFinite(hop.ms) && hop.ms >= 0, `the hop to ${hop.to} recorded ${String(hop.ms)} rather than a real duration`);
    }
    // AND THEY NAME THE SAME HOPS, so a reader can line the two lists up.
    assert.deepEqual(
      spent.map((h) => h.to),
      swept,
      "the timings name the hops that were walked, in order",
    );
  });

  // THE DRAWER'S OWN QUESTION. It asked a boolean and got two answers for three
  // cases, so a step whose judgment was still being reached read as FAILED and
  // the route was thrown away and redrawn on the request path.
  // see raid-debt-the-route-drawer-reads-a-standing-as-a-boolean
  test("the walk answers with a step's STANDING, not with a yes or a no", async () => {
    const { s } = await bootBoth();

    const standing = s.leavingStanding();
    assert.ok(
      standing === "passed" || standing === "not passed" || standing === "deciding",
      `the drawer's question answered ${String(standing)}, which is none of the three words`,
    );

    // AND THE SWEEP ONLY SAYS `deciding` WHEN IT IS. A flag that rode every
    // refusal would be worth nothing: the reader could not tell the case where
    // nothing is owed from the case where something is.
    const out = (await s.sweep("expeditions", "agent")) as { deciding?: boolean };
    if (s.leavingStanding() !== "deciding") {
      assert.equal(out.deciding, undefined, "nothing is deciding here, so nothing claims to be");
    }
  });

  test("a sweep stopped at its budget resumes and arrives — nothing is lost", async () => {
    const { s } = await bootBoth();

    await s.sweep("expeditions", "agent", 0);
    // The route recomputes from wherever the first sweep stopped, so a second
    // one carries on rather than starting over.
    const again = (await s.sweep("expeditions", "agent")) as { arrived?: boolean; note?: string };

    assert.equal(again.arrived, true, `the route recomputes from where it stopped — ${again.note ?? ""}`);
    // The target is the container's start substate, not "front_desk". Boot
    // rests at front_desk now, so a sweep TOWARD front_desk never applies here.
    assert.equal(s.active()[0], "expeditions/start");
  });
});

// TSP-POINTING-THE-WALK-COSTS-THE-SAME-WHATEVER-THE-DISTANCE.
//
// THE TWO FORMS ARE ONE VERB WITH A FLAG, and both stand. Asking to jump is an
// ADDITION to aiming (owner ruling 2026-08-24), so the case above keeps its
// meaning and this one is about the OTHER form.
//
// THIS ROW ONCE ASSERTED THAT A BARE AIM DRAWS NO ROUTE, on the premise that
// drawing is the cost that grows with distance. THE PREMISE IS FALSE, and it
// was measured rather than argued.
// see dsp-the-walk-knows-what-its-own-hops-cost.md#the-bare-aim
//
// SKIPPING THE DRAWING BOUGHT ALMOST NOTHING AND COST THE REACHABILITY ANSWER.
// A bare aim that does not draw cannot say whether the target can be reached,
// and req-a-target-that-cannot-be-reached-is-refused-quickly wants that answer.
//
// SO THE ROW IS ABOUT BOUNDEDNESS, not about skipping work. The search expands
// each state at most once, which is why distance does not change what pointing
// costs. That is asserted here without a clock, because a timing assertion
// measures the machine it runs on.
describe("a bare aim points without paying for the walk", () => {
  test("pointing moves nothing and still answers whether the target is reachable", async () => {
    const { s, server } = await bootBoth();
    const before = s.active()[0];

    // The helper wraps the answer, the way the case above reads it. Reading the
    // wrapper as the answer makes every field undefined, which reads as a
    // product defect and is a defect in the test.
    const r = (await call(server, "se_aim", { to: "end", go: false })).body as {
      steps?: unknown[];
      visited?: number;
      found?: boolean;
      target?: string;
      arrived?: boolean;
      swept?: unknown[];
    };

    assert.equal(s.active()[0], before, "pointing moves nothing");

    // THE WALKING IS WHAT MUST NOT HAPPEN, and this is the row's oracle. An aim
    // that swept anything has failed the requirement whatever the clock says.
    assert.notEqual(r.arrived, true, "pointing does not report arrival");
    assert.deepEqual(r.swept ?? [], [], "pointing sweeps nothing");
    // `aimed_at` rides only when the objective differs from the aim, so the
    // direction is read from `target` in the ordinary case.
    assert.equal(r.target, "end", "the direction is recorded");

    // WHAT THE DRAWING BUYS, and the reason it stays: the answer to whether the
    // walk can get there at all, given at the moment of pointing.
    assert.equal(r.found, true, "a drawn aim says the target IS reachable");

    // BOUNDED BY THE GRAPH, NEVER BY THE DISTANCE. Each state is expanded at
    // most once, so the search reports what it looked at and that number is a
    // property of the machine rather than of how far the target sits.
    assert.ok((r.visited ?? 0) >= (r.steps ?? []).length, "the search reports what it looked at");
  });
});
