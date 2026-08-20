// EMERGENCY — the tool gate lifted, everywhere.
//
// The gate is what makes a state mean something: it holds the tools the work
// needs and no more. That is right while the machine is sound and exactly
// wrong in the two cases this exists for — repairing a broken engine, and
// building the lane while walking through it.
//
// So the properties here are all about it being HARD TO REACH and IMPOSSIBLE
// TO FORGET. It arms only from the top rung. It dies with that rung. It never
// survives a restart. And nothing in the resting packet says it exists.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const root = (): string => freshRoot();

function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

/** A tool no state makes legal at boot, so the gate is the only thing deciding. */
const GUARDED = "se_file_write";

describe("it is off, and invisible, until somebody arms it", () => {
  test("a fresh session is not in emergency", () => {
    assert.equal(new Session(root()).emergency, false);
  });

  test("the resting packet says nothing about it at all", () => {
    const packet = new Session(root()).packet() as Record<string, unknown>;
    assert.equal("emergency" in packet, false, "an absent key is how a hidden thing stays hidden");
  });

  test("the gate refuses a guarded tool at boot, as it always did", () => {
    refusal(() => new Session(root()).gate(GUARDED));
  });
});

describe("arming it", () => {
  test("it refuses below the top rung — it is past full delegation, not around it", () => {
    const s = new Session(root());
    s.setAutonomy(0.6);
    const r = refusal(() => s.setEmergency(true));
    assert.match(r.expected, /top rung/);
    assert.equal(s.emergency, false);
  });

  test("at the top rung it arms", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    assert.equal(s.emergency, true);
  });

  test("armed, every tool is legal wherever the walk stands", () => {
    const s = new Session(root());
    refusal(() => s.gate(GUARDED));
    s.setAutonomy(1);
    s.setEmergency(true);
    s.gate(GUARDED);
    s.gate("se_git");
    s.gate("se_run");
  });

  test("the packet says so, but only once it is on", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    const packet = s.packet() as { emergency?: boolean };
    assert.equal(packet.emergency, true);
  });
});

describe("it cannot outlive what granted it", () => {
  // The whole safety story. There is no second control to remember, because
  // lowering the rung IS revoking it.
  test("lowering the autonomy disarms it", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    s.setAutonomy(0.6);
    assert.equal(s.emergency, false);
    refusal(() => s.gate(GUARDED));
  });

  test("dropping to blocked disarms it too", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    s.setAutonomy(0);
    assert.equal(s.emergency, false);
  });

  test("staying at the top rung keeps it", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    s.setAutonomy(1);
    assert.equal(s.emergency, true);
  });

  test("it can be turned off by hand without touching the rung", () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setEmergency(true);
    s.setEmergency(false);
    assert.equal(s.emergency, false);
    assert.equal(s.autonomy, 1, "the rung is untouched");
  });

  // An emergency that survives a restart is a gate quietly missing, and
  // nobody would know to look for it.
  //
  // THE SESSION STAMP IS SET HERE, and that is the whole point of the case.
  // A RELOAD and a RESTART are the same code path with one difference: whether
  // the settings on disk carry THIS session's stamp. restoreSettings reads
  // SE_SESSION and restores nothing without a match, which is what makes
  // emergency die with the session that granted it.
  //
  // SO A TEST THAT DOES NOT SET IT IS NOT TESTING THE RELOAD — it is testing
  // the restart, and passing for the wrong reason. This case read the ambient
  // environment instead: green when run through the lane, which spawns the
  // engine with a stamp (engine/bin/se-mcp.ts), and red under a plain
  // npm test. Measured 2026-08-17: 3 of 3 red standalone, green with a stamp.
  test("emergency survives the reload it was granted through — and a lowered dial revokes it for good", () => {
    const had = process.env.SE_SESSION;
    process.env.SE_SESSION = "emergency-reload-case";
    try {
      const r = root();
      const a = new Session(r);
      a.setAutonomy(1);
      a.setEmergency(true);
      assert.equal(new Session(r).emergency, true, "a reload mid-session keeps the granted delegation");
      a.setAutonomy(0.6);
      assert.equal(new Session(r).emergency, false, "lowering the dial revokes it now");
      assert.equal(new Session(r).emergency, false, "and in the next life too");
    } finally {
      if (had === undefined) delete process.env.SE_SESSION;
      else process.env.SE_SESSION = had;
    }
  });

  // THE OTHER HALF, and it is the half the file's own header promises: a
  // RESTART is a different session, so the stamp does not match and the
  // delegation does not come back. Without this case, setting the stamp above
  // could hide exactly the gate this file exists to guard.
  test("emergency does NOT survive a restart — a different session gets nothing back", () => {
    const had = process.env.SE_SESSION;
    process.env.SE_SESSION = "the-session-that-armed-it";
    try {
      const r = root();
      const a = new Session(r);
      a.setAutonomy(1);
      a.setEmergency(true);
      assert.equal(new Session(r).emergency, true, "still armed inside its own session");
      process.env.SE_SESSION = "a-later-session";
      assert.equal(new Session(r).emergency, false, "a restart is a new session, and it gets no delegation back");
    } finally {
      if (had === undefined) delete process.env.SE_SESSION;
      else process.env.SE_SESSION = had;
    }
  });
});

describe("the surface", () => {
  test("the top rung draws as E, red, only when armed", async () => {
    const { renderPanel, parsePanel } = await import("../engine/params.ts");
    const spec = parsePanel("## Parameters\n\n- autonomy | rungs | scale | help\n");
    const rungs = [
      { value: 0.01, abbr: "M", name: "mechanical" },
      { value: 1, abbr: "I", name: "ideation" },
    ];

    const off = renderPanel(spec, { rungs, autonomy: 1, ints: {} });
    assert.match(off, />I</, "the top rung is itself");
    assert.ok(!off.includes("emergency"), "and nothing names the hidden rung");

    const on = renderPanel(spec, { rungs, autonomy: 1, emergency: true, ints: {} });
    assert.match(on, />E</);
    assert.match(on, /class="rung on danger emergency"/);
    assert.match(on, /every tool is legal in every state/, "it says what it is doing");
  });

  test("only the top rung ever becomes E", async () => {
    const { renderPanel, parsePanel } = await import("../engine/params.ts");
    const spec = parsePanel("## Parameters\n\n- autonomy | rungs | scale | help\n");
    const rungs = [
      { value: 0.01, abbr: "M", name: "mechanical" },
      { value: 1, abbr: "I", name: "ideation" },
    ];
    const on = renderPanel(spec, { rungs, autonomy: 1, emergency: true, ints: {} });
    assert.equal((on.match(/>E</g) ?? []).length, 1);
    assert.match(on, />M</, "the lower rung keeps its own letter");
  });
});
