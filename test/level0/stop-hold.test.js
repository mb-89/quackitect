// The hold from the sidebar: at stop every call but the ones that end a turn
// is refused, at finish the block rides every call, a hold no call meets stands
// into the next turn, and a prompt landing mid-turn holds the session.
// [[spec/design_output/stop#the-hold]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { CHECK } from "../../.claude/skills/level0/lib/answer.js";
import { STOP_CALL } from "../../.claude/skills/level0/lib/stop.js";
import { REPORT_CALL } from "../../src/bridge/report.js";
import {
  dropsHold,
  holdsCall,
  onStop,
  sawCall,
  sawPrompt,
} from "../../src/bridge/stop.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const AT = join(ROOT, "spec", "config", "level0.json");
const LOCAL = join(ROOT, ".se", ".runtime", "config.json");

function box(hold) {
  const said = [];
  return {
    said,
    disk: fakeDisk({ [AT]: JSON.stringify({ stop: { enabled: true, hold } }) }),
    work: ROOT,
    method: ROOT,
    clock: fakeClock(),
    log: { say: (...row) => said.push(row) },
  };
}

const RULES = `
- id: the-owner-holds-this-session
  side: stop
  priority: 85
  decides: mechanical
  runs: owner-holds
  says: The owner holds this session at stop, so this turn ends here.

- id: the-owner-asks-to-finish
  side: stop
  priority: 84
  decides: mechanical
  runs: owner-finishes
  says: The owner holds this session at finish, so this turn ends with the piece in hand.

- id: the-queue-holds-work
  side: continue
  priority: 80
  decides: mechanical
  runs: work-waiting
  says: The queue holds work for this box, so carry on.

- id: the-tooth-is-out
  side: continue
  priority: 0
  decides: mechanical
  runs: stop-hook-off
  says: The stop hook stands off.
`;

// A turn ending under the rules, with a list standing, so a hold has something to end. [[spec/design_output/stop#the-hold]]
function ruled(hold) {
  const it = box(hold);
  it.disk.write(join(ROOT, "spec", "config", "stop", "level0.yml"), RULES);
  it.todos = { standing: () => true, sawCall: () => {} };
  return it;
}

// The sidebar writes the hold into the local config, and the tracked file carries the standing value. [[spec/design_output/config#the-layers]]
function held(it) {
  try {
    const local = JSON.parse(it.disk.read(LOCAL))?.stop?.hold;
    if (local !== undefined) return local;
  } catch {}
  return JSON.parse(it.disk.read(AT)).stop.hold;
}

test("the hold at stop refuses a working call, and names what stands instead", () => {
  const it = box("stop");
  const said = holdsCall({ tool: "Bash" }, it);
  assert.match(said.result.deny, /holds this session at stop/);
  assert.match(said.result.deny, /Put the work down/);
  assert.match(said.result.deny, /Make no other call/);
  assert.match(said.result.deny, /stop line/);
});

test("the hold at stop lets the three calls a turn ends with through", () => {
  for (const tool of [REPORT_CALL, STOP_CALL, `mcp__level0__${CHECK}`]) {
    const said = holdsCall({ tool }, box("stop"));
    assert.equal(said.result, undefined, `${tool} passes`);
    assert.match(
      said.after.context[0],
      /holds this session at stop/,
      "and it carries the line",
    );
  }
});

test("the hold at finish rides the block on every call, not on the first alone", () => {
  const it = box("finish");
  for (const tool of ["Bash", "Read", "Edit"]) {
    const said = holdsCall({ tool }, it);
    assert.match(
      said.after.context[0],
      /Bring what you hold to a point/,
      `${tool} carries the line`,
    );
    assert.match(said.after.context[0], /take nothing new out of the queue/);
  }
});

test("the hold ends the turn it lands in, and the turn's end puts it back", () => {
  const it = box("stop");
  holdsCall({ tool: "Bash" }, it);
  dropsHold({}, it);
  assert.equal(held(it), "off", "the turn ends, and the hold flips back");
  assert.equal(holdsCall({ tool: "Bash" }, it), null, "the next turn runs free");
});

test("a helper's call meets no hold", () => {
  assert.equal(holdsCall({ tool: "Bash", agentId: "a1" }, box("stop")), null);
});

// [[spec/design_output/stop#the-hold]]
test("either strength ends the turn, over a rule that would hold it open", () => {
  for (const hold of ["finish", "stop"]) {
    const it = ruled(hold);
    assert.deepEqual(
      onStop({ last_assistant_message: "Working on." }, it),
      { pass: true },
      `the hold at ${hold} ends the turn`,
    );
    assert.match(it.said.at(-1)[2], /the turn ends/);
  }
});

test("a turn ends on its own rules while no hold stands", () => {
  const said = onStop({ last_assistant_message: "Working on." }, ruled("off"));
  assert.match(said.result.block, /holds work for this box|names no stop reason/);
});

test("a prompt writes no hold, because the owner's own press is the hold", () => {
  const it = box("off");
  sawCall({ tool: "Bash" }, it);
  sawPrompt({ text: "get to a point where you can push" }, it);
  assert.equal(held(it), "off");
  assert.equal(holdsCall({ tool: "Read" }, it), null);
});
