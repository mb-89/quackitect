// THE POWER CONTROL — two buttons, neither implying the other.
//
// It replaced a five-notch slider, and the reason is the property this file
// exists to hold: the two settings are INDEPENDENT. A scale said you had to
// pass through "keep awake" to reach the rest, and that both could not be off
// once either was on. Both were false.
//
// THE ENGINE WATCHES, THE MACHINE SHUTS DOWN. The engine is this server; the
// machine is the computer. The engine owns the timer, and it has to: a
// shutdown waiting for the agent to notice would never fire, because an agent
// that has stopped is exactly what idle means.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { loadPanel, parsePanel, renderPanel, toggleKey, type PanelValues } from "../engine/params.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const VALUES: PanelValues = { rungs: [], autonomy: 0, ints: {} };

const panel = (line: string): ReturnType<typeof parsePanel> => parsePanel(`## Parameters\n\n- ${line}\n`);

function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

describe("the toggles parameter type", () => {
  test("a key falls out of the label, so the spec stays readable prose", () => {
    assert.equal(toggleKey("block auto-sleep"), "block-auto-sleep");
    assert.equal(toggleKey("shutdown at idle"), "shutdown-at-idle");
  });

  test("every field becomes its own button", () => {
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at idle | help"), VALUES);
    assert.match(html, /data-toggle="block-auto-sleep"/);
    assert.match(html, /data-toggle="shutdown-at-idle"/);
  });

  test("both can be on at once, which is the whole reason it is not a choice", () => {
    const on: PanelValues = { ...VALUES, toggles: { "block-auto-sleep": true, "shutdown-at-idle": true } };
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at idle | help"), on);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
    assert.ok(!html.includes("<select"), "a select would say they exclude each other");
  });

  test("none pressed is a state, not a missing value", () => {
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at idle | help"), VALUES);
    assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 2);
    assert.equal((html.match(/class="rung param-toggle"/g) ?? []).length, 2, "neither carries the on class");
  });

  test("the row carries its label once, like every other row", () => {
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | help"), VALUES);
    assert.equal((html.match(/param-label/g) ?? []).length, 1);
  });

  test("an unknown type is still a refusal, and names toggles among the known", () => {
    const r = refusal(() => renderPanel(panel("x | hologram | y | help"), VALUES));
    assert.match(r.expected, /toggles/);
  });
});

describe("the shipped controls spec", () => {
  test("it declares the shutdown row with both buttons", () => {
    const params = loadPanel(freshRootWithProduct(), "controls");
    const row = params.find((p) => p.name === "shutdown");
    assert.ok(row !== undefined, "the controls panel declares a shutdown row");
    assert.equal(row.type, "toggles");
    assert.deepEqual(row.fields, ["block auto-sleep", "shutdown at idle"]);
  });
});

/** The real repository, because the shipped spec is what this asserts. */
function freshRootWithProduct(): string {
  return new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
}

describe("the power flags on the session", () => {
  const root = (): string => freshRoot();

  test("both start off, so a fresh session touches power at all", () => {
    const s = new Session(root());
    assert.deepEqual(s.power, { block_sleep: false, shutdown_at_idle: false });
  });

  test("each sets independently", () => {
    const s = new Session(root());
    s.setPower("block-auto-sleep", true);
    assert.deepEqual(s.power, { block_sleep: true, shutdown_at_idle: false });
    s.setPower("shutdown-at-idle", true);
    assert.deepEqual(s.power, { block_sleep: true, shutdown_at_idle: true });
  });

  test("turning one off leaves the other standing", () => {
    const s = new Session(root());
    s.setPower("block-auto-sleep", true);
    s.setPower("shutdown-at-idle", true);
    s.setPower("block-auto-sleep", false);
    assert.deepEqual(s.power, { block_sleep: false, shutdown_at_idle: true });
  });

  test("an unknown toggle refuses and names both", () => {
    const r = refusal(() => new Session(root()).setPower("power-off-now", true));
    assert.equal(r.got, "power-off-now");
    assert.match(r.expected, /block-auto-sleep/);
    assert.match(r.expected, /shutdown-at-idle/);
  });

  test("the packet carries the flags, so a host draws from the machine", () => {
    const s = new Session(root());
    s.setPower("shutdown-at-idle", true);
    const packet = s.packet() as { power?: { shutdown_at_idle?: boolean } };
    assert.equal(packet.power?.shutdown_at_idle, true);
  });
});

describe("the idle clock", () => {
  const root = (): string => freshRoot();

  test("a session that just acted is not idle", () => {
    assert.equal(new Session(root()).idleFor(60_000), false);
  });

  // IDLE IS THREE CONDITIONS, NOT ONE. A silent clock is not enough: a walk
  // standing mid-machine is work in progress, and stopping the server under it
  // would strand it.
  test("a walk that is not at idle is never idle, however long the silence", () => {
    const s = new Session(root());
    assert.notEqual(s.active()[0], "idle", "a fresh session stands at start, not idle");
    assert.equal(s.idleFor(0), false, "zero silence required, and it still refuses");
  });

  // THE ONE THAT MATTERS. Any hand at all resets the clock, so the machine
  // cannot stop under a person who is reading rather than typing.
  test("an act resets the clock, whichever hand made it", () => {
    const s = new Session(root());
    s.setPower("block-auto-sleep", true);
    assert.equal(s.idleFor(60_000), false, "the click just now counts as activity");
  });

  test("the window is five minutes, and it is named rather than buried", () => {
    assert.equal(Session.IDLE_MINUTES, 5);
  });
});

describe("the shutdown is armed, never automatic", () => {
  // Shutting a machine down is the most irreversible act in this repository,
  // so the guard is that it CANNOT happen unless somebody pressed the button.
  test("exactly one place shuts the machine down, and it is inside checkIdle", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../engine/session.ts", import.meta.url), "utf8");
    const calls = [...src.matchAll(/spawn\("shutdown\.exe"/g)];
    assert.equal(calls.length, 1);
    const before = src.slice(0, calls[0].index);
    assert.ok(before.lastIndexOf("private checkIdle") > before.lastIndexOf("\n  }"), "the call sits inside checkIdle");
  });

  test("checkIdle returns early unless the flag is set", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../engine/session.ts", import.meta.url), "utf8");
    const body = src.slice(src.indexOf("private checkIdle"));
    assert.match(body.slice(0, 200), /if \(!this\._shutdownAtIdle\) return;/);
  });

  test("the spec says the engine watches and the machine shuts down", async () => {
    const { readFileSync } = await import("node:fs");
    const spec = readFileSync(new URL("../machines/panels/controls.md", import.meta.url), "utf8");
    assert.match(spec, /THE ENGINE IS THIS SERVER AND THE MACHINE IS THE COMPUTER/);
  });
});
