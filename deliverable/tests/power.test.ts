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
import { describe, test } from "node:test";
import { loadPanel, type PanelValues, parsePanel, renderPanel, toggleKey } from "../engine/params.ts";
import { Session } from "../engine/session.ts";
import { Liveness } from "../engine/sessionlive.ts";
import { freshRoot, refusal } from "./helpers.ts";

const VALUES: PanelValues = { rungs: [], autonomy: 0, ints: {} };

const panel = (line: string): ReturnType<typeof parsePanel> => parsePanel(`## Parameters\n\n- ${line}\n`);

describe("the toggles parameter type", () => {
  test("a key falls out of the label, so the spec stays readable prose", () => {
    assert.equal(toggleKey("block auto-sleep"), "block-auto-sleep");
    assert.equal(toggleKey("shutdown at front desk"), "shutdown-at-front-desk");
  });

  test("every field becomes its own button", () => {
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at front desk | help"), VALUES);
    assert.match(html, /data-toggle="block-auto-sleep"/);
    assert.match(html, /data-toggle="shutdown-at-front-desk"/);
  });

  test("both can be on at once, which is the whole reason it is not a choice", () => {
    const on: PanelValues = { ...VALUES, toggles: { "block-auto-sleep": true, "shutdown-at-front-desk": true } };
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at front desk | help"), on);
    assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
    assert.ok(!html.includes("<select"), "a select would say they exclude each other");
  });

  test("none pressed is a state, not a missing value", () => {
    const html = renderPanel(panel("shutdown | toggles | block auto-sleep | shutdown at front desk | help"), VALUES);
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
    assert.deepEqual(row.fields, ["block auto-sleep", "shutdown at front desk"]);
  });
});

/** The real repository, because the shipped spec is what this asserts. */
function freshRootWithProduct(): string {
  return new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
}

describe("the power flags on the session", () => {
  const root = (): string => freshRoot();

  test("both start off, so a fresh session touches power at all", () => {
    const s = new Session(root());
    assert.deepEqual(s.power, { block_sleep: false, shutdown_at_front_desk: false });
  });

  test("each sets independently", () => {
    const s = new Session(root());
    s.setPower("block-auto-sleep", true);
    assert.deepEqual(s.power, { block_sleep: true, shutdown_at_front_desk: false });
    s.setPower("shutdown-at-idle", true);
    assert.deepEqual(s.power, { block_sleep: true, shutdown_at_front_desk: true });
  });

  test("turning one off leaves the other standing", () => {
    const s = new Session(root());
    s.setPower("block-auto-sleep", true);
    s.setPower("shutdown-at-idle", true);
    s.setPower("block-auto-sleep", false);
    assert.deepEqual(s.power, { block_sleep: false, shutdown_at_front_desk: true });
  });

  test("an unknown toggle refuses and names both", () => {
    const r = refusal(() => new Session(root()).setPower("power-off-now", true));
    assert.equal(r.got, "power-off-now");
    assert.match(r.expected, /block-auto-sleep/);
    assert.match(r.expected, /shutdown-at-front-desk/);
  });

  test("the packet carries the flags, so a host draws from the machine", () => {
    const s = new Session(root());
    s.setPower("shutdown-at-idle", true);
    const packet = s.packet() as { power?: { shutdown_at_front_desk?: boolean } };
    assert.equal(packet.power?.shutdown_at_front_desk, true);
  });
});

// ONE NAME, THREE PLACES, AND THEY HAVE TO MEET.
//
// The caption in the spec becomes the button's key. The button posts that key.
// The page then reads its own state back out of `power` by turning that key's
// hyphens into underscores. A field named anything else reads as undefined, so
// the button snapped back to OFF on the next push, and the reader could not
// tell a click that failed from a click that took.
//
// THE FLAG ITSELF WAS SET THE WHOLE TIME. Only the button lied, which is the
// worst shape this can have.
describe("the toggle's caption, its key and the engine's field are one name", () => {
  test("the page's own derive finds the field", () => {
    const key = "shutdown at front desk".replace(/ /g, "-");
    const s = new Session(freshRoot());

    s.setPower(key, true);

    assert.equal((s.power as unknown as Record<string, boolean>)[key.replace(/-/g, "_")], true);
  });

  test("the old key still sets the same flag, because a page served before the rename posts it", () => {
    const s = new Session(freshRoot());

    s.setPower("shutdown-at-idle", true);

    assert.equal(s.power.shutdown_at_front_desk, true);
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
    assert.notEqual(s.active()[0], "front_desk", "a fresh session stands at start, not idle");
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
    assert.equal(Liveness.IDLE_MINUTES, 5);
  });
});

describe("the shutdown is armed, never automatic", () => {
  // Shutting a machine down is the most irreversible act in this repository,
  // so the guard is that it CANNOT happen unless somebody pressed the button.
  test("exactly one place shuts the machine down, and it is inside checkIdle", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../engine/sessionlive.ts", import.meta.url), "utf8");
    const calls = [...src.matchAll(/spawn\("shutdown\.exe"/g)];
    assert.equal(calls.length, 1);
    const before = src.slice(0, calls[0].index);
    assert.ok(before.lastIndexOf("private checkIdle") > before.lastIndexOf("\n  }"), "the call sits inside checkIdle");
  });

  // THE FLAG IS ASKED BEFORE ANYTHING ELSE, and this is the behaviour rather
  // than the line. Pinning the source said nothing about what the clock does
  // and broke the moment the guard grew a body.
  test("an unarmed clock says nothing, whatever the walk is doing", () => {
    const said: string[] = [];
    const live = new Liveness({
      persist: () => {},
      describe: () => ({ active: ["iterations/i63/build-steps"] }),
      say: (line: string) => said.push(line),
    });

    (live as unknown as { checkIdle: () => void }).checkIdle();

    assert.equal(live.inactiveMinutes, undefined, "nothing is counting");
    assert.deepEqual(said, [], "and an unarmed clock has no opinion about where the walk stands");
  });

  test("the spec says the engine watches and the machine shuts down", async () => {
    const { readFileSync } = await import("node:fs");
    const spec = readFileSync(new URL("../machines/panels/controls.md", import.meta.url), "utf8");
    assert.match(spec, /THE ENGINE IS THIS SERVER AND THE MACHINE IS THE COMPUTER/);
  });
});

// THE WATCHDOG SAYS HOW LONG IT HAS BEEN QUIET, once per whole minute.
//
// A SILENT FIVE MINUTES AND THEN A DARK MACHINE is indistinguishable from a
// toggle that never worked, which is what the reader reported.
//
// IT REPORTS THE FACT, NEVER THE RULE. "Inactive for 3 of 5 minutes" is
// something the reader can check against what they just did.
// see dsp-boot-and-power.md#what-survives-a-reload-and-what-does-not
describe("the watchdog reports how long it has been quiet", () => {
  const MINUTE = 60_000;

  /** A liveness parked at the desk: every line it said, a walk that can move
   *  under it, and a way to say how long ago the last activity was. */
  function parked(where = "front_desk"): {
    live: Liveness;
    said: string[];
    tick: () => void;
    walkTo: (state: string) => void;
    quietFor: (minutes: number) => void;
  } {
    const said: string[] = [];
    let at = where;
    const live = new Liveness({
      persist: () => {},
      describe: () => ({ active: [at] }),
      say: (line: string) => said.push(line),
    });
    return {
      live,
      said,
      // The private tick, reached the way the interval reaches it.
      tick: () => (live as unknown as { checkIdle: () => void }).checkIdle(),
      walkTo: (state: string) => {
        at = state;
      },
      // The last activity was this many minutes ago.
      quietFor: (minutes: number) => live.touch(Date.now() - minutes * MINUTE),
    };
  }

  test("an unarmed machine counts nothing and says nothing", () => {
    const { live, said, tick, quietFor } = parked();
    quietFor(3);

    tick();

    assert.equal(live.inactiveMinutes, undefined, "nothing is counting");
    assert.deepEqual(said, [], "and nothing was announced");
  });

  // THE ORDINARY CASE IS SILENCE. Something happened in the last minute, which
  // is true of almost every tick while anybody is working.
  test("under a minute of quiet says nothing at all", () => {
    const { live, said, tick } = parked();
    live.setPower("shutdown-at-front-desk", true);

    tick();

    assert.equal(live.inactiveMinutes, undefined, "nothing is counted");
    assert.deepEqual(said, [], "a line here would be one on every quiet tick");
  });

  test("each whole minute of quiet is reported once, counting up", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);

    quietFor(1);
    tick();
    quietFor(2);
    tick();
    quietFor(3);
    tick();

    assert.equal(live.inactiveMinutes, 3);
    assert.deepEqual(said, ["inactive for 1 of 5 minutes", "inactive for 2 of 5 minutes", "inactive for 3 of 5 minutes"]);
  });

  test("a second tick inside the same minute says nothing, because the figure did not move", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(2);

    tick();
    tick();

    assert.deepEqual(said, ["inactive for 2 of 5 minutes"], "the tick repeats and the figure does not");
  });

  // ACTIVITY IS THE ORDINARY CASE, SO IT IS SILENT. A line every time somebody
  // did something would be the noise this counter exists to avoid.
  test("activity stops the count without a word", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(3);
    tick();
    said.length = 0;

    live.touch();
    tick();

    assert.equal(live.inactiveMinutes, undefined, "nothing is counting any more");
    assert.deepEqual(said, [], "and nothing was said about it");
  });

  test("the count starts from one again once it goes quiet a second time", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(3);
    tick();
    live.touch();
    tick();
    said.length = 0;

    quietFor(1);
    tick();

    assert.equal(live.inactiveMinutes, 1, "from the top, not from where it left off");
    assert.deepEqual(said, ["inactive for 1 of 5 minutes"]);
  });

  test("releasing the toggle stops it, silently", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(2);
    tick();
    said.length = 0;

    live.setPower("shutdown-at-front-desk", false);
    tick();

    assert.equal(live.inactiveMinutes, undefined);
    assert.deepEqual(said, []);
  });

  test("a walk in progress is never counted, and the toggle is left as the person set it", () => {
    const { live, said, tick, walkTo, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(2);
    tick();
    said.length = 0;

    walkTo("iterations/i63/build-steps");
    tick();

    assert.equal(live.inactiveMinutes, undefined, "work in progress is never counted");
    assert.deepEqual(said, []);
    assert.equal(live.power.shutdown_at_front_desk, true, "the toggle is the person's, not the clock's");
  });

  // THE COUNTER CANNOT HEAR ITS OWN VOICE. What it says goes to the lifecycle
  // log under a `shutdown` event; what resets it is the CALL log. Two files,
  // two origins — so a line it wrote can never read as activity.
  test("what it says never counts as activity", () => {
    const { live, said, tick, quietFor } = parked();
    live.setPower("shutdown-at-front-desk", true);
    quietFor(2);

    tick();
    tick();

    assert.equal(live.inactiveMinutes, 2, "its own line did not reset the clock it reads");
    assert.deepEqual(said, ["inactive for 2 of 5 minutes"]);
  });
});
