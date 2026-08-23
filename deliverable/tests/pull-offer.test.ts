// THE PULL — what it hands back.
//
// Two properties, and they pull against each other on purpose.
//
// THE BATCH: a pull does not hand over one step. It hands over every step
// on the happy path up to the next branching point (owner, 2026-08-01).
// Start to front desk has no branch in it, so it must not cost a round trip
// per hop.
//
// THE SIZE: the owner's own question about that batch was how the answer
// avoids overflowing, and their hint was "maybe not all the details". So
// steps arrive in full and DETAIL DOES NOT — guidance text rides the reading,
// which credits it, and the per-field guidance rides the form itself.
//
// Split from pull.test.ts by theme; each case here costs a boot walk. See
// guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot, readEverything, sessionAtIdle } from "./helpers.ts";

const root = (): string => freshRoot();

describe("the batch", { concurrency: true }, () => {
  test("`do` walks the whole happy path in ONE call, not one hop per call", async () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setTarget("front_desk");
    // The answer that STOPS the reading is the one that walks.
    const r = await readEverything(s);
    assert.equal(r.pull, "do");
    assert.ok((r.walked as string[]).length > 1, `one call walked ${JSON.stringify(r.walked)} — the batch is the point`);
    assert.equal(r.arrived, true);
  });

  test("`here` carries the guidance but not the pulled documents", async () => {
    // sessionAtIdle now rests AT front_desk itself (idle was renamed into
    // it), so it would already have spent the one hop this case wants to
    // watch. Start from a fresh, un-arrived session instead.
    const s = new Session(root());
    checkDocs(s);
    s.setAutonomy(1);
    s.setTarget("front_desk");
    // The answer that STOPS the reading is the one that walks.
    const r = await readEverything(s);
    const here = (r.here as Record<string, unknown>[])[0];
    assert.equal(here.id, "front_desk");
    assert.ok(String(here.guidance).length > 0, "the agent needs the guidance to act");
    assert.equal("pulled" in here, false, "guidance text rides the reading, never the offer");
  });
});

describe("the offer", { concurrency: true }, () => {
  test("with no target away from the desk, the walk comes home first; at the desk it waits with options", async () => {
    // Same reason as above: sessionAtIdle already rests at front_desk, so it
    // cannot show the walk COMING home. Start away from it instead.
    const s = new Session(root());
    checkDocs(s);
    s.setAutonomy(1);
    s.setTarget("");
    const routed = await readEverything(s);
    assert.equal(routed.pull, "do");
    assert.deepEqual(s.active(), ["front_desk"]);
    const r = (await s.pull()) as Record<string, unknown>;
    assert.equal(r.pull, "wait");
    const options = r.options as Record<string, unknown>[];
    assert.ok(options.length > 1, "the desk should still surface the live doors");
    // THE DOOR CHECKED HERE USED TO BE THE DESK ITSELF, offered from the hub
    // that stood in front of it. The desk IS the hub now, and a state has no
    // edge to itself, so the mechanical door checked is `end`.
    const way = options.find((o) => o.to === "end");
    assert.ok(way !== undefined, "end is one of them");
    // THE WEIGHT IS A WORD (req-autonomy-is-categorical; owner 2026-08-16).
    // Every door of every pull used to carry `priority: 0.2`, so the number
    // the answer had stopped saying at the top was said a dozen times below it.
    assert.equal(way.priority, undefined, "no served surface carries a bare autonomy number");
    assert.equal(way.weight, "mechanical", "the weight rides along as the rung's own word");
  });

  // THIS CASE TURNED OVER WHEN THE HUB WAS REMOVED. It used to demand that a
  // state called `idle` offer the desk as one of its doors, because the hub
  // was a thoroughfare and the desk was a destination beyond it.
  //
  // THE DESK IS THE HUB NOW, so that door would be a state offering itself.
  // The case guards the new shape instead: nobody re-adds a self-edge, and the
  // doors the desk really has are still offered.
  test("the desk offers no door to itself — it IS the hub, so parking there is standing still", async () => {
    const s = await sessionAtIdle(root());
    s.setTarget("");
    await readEverything(s);
    const r = (await s.pull()) as Record<string, unknown>;
    const options = r.options as Record<string, unknown>[];
    assert.equal(
      options.find((o) => o.to === "front_desk"),
      undefined,
      "a state has no edge to itself, and a door to where you stand goes nowhere",
    );
    assert.ok(options.length > 1, "the doors it does have are still offered");
  });

  test("an option above the slider is offered as NOT open, and says who it needs", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(0.4);
    s.setTarget("");
    await readEverything(s);
    const r = (await s.pull()) as Record<string, unknown>;
    const heavy = (r.options as Record<string, unknown>[]).find((o) => o.to === "overhaul");
    assert.ok(heavy !== undefined);
    assert.equal(heavy.open, false);
    assert.match(String(heavy.needs), /the person/);
  });
});
