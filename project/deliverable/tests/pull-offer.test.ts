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
import { freshRoot, readEverything, sessionAtIdle } from "./helpers.ts";

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
    const s = await sessionAtIdle(root());
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
    const s = await sessionAtIdle(root());
    s.setTarget("");
    const routed = await readEverything(s);
    assert.equal(routed.pull, "do");
    assert.deepEqual(s.active(), ["front_desk"]);
    const r = (await s.pull()) as Record<string, unknown>;
    assert.equal(r.pull, "wait");
    const options = r.options as Record<string, unknown>[];
    assert.ok(options.length > 1, "the desk should still surface the live doors");
    const desk = options.find((o) => o.to === "front_desk");
    assert.ok(desk !== undefined, "the front desk is one of them");
    assert.equal(typeof desk.priority, "number", "the weight rides along with the waiting options");
  });

  test("idle itself is among the desk's doors — the hub is a destination, not only a thoroughfare", async () => {
    const s = await sessionAtIdle(root());
    s.setTarget("");
    await readEverything(s);
    const r = (await s.pull()) as Record<string, unknown>;
    const idle = (r.options as Record<string, unknown>[]).find((o) => o.to === "idle");
    assert.ok(idle !== undefined, "idle is offered at the desk");
    assert.equal(idle.open, true, "nothing blocks parking at the hub");
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
