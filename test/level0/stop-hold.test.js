// The hold from the sidebar: at stop every call but the three that end a turn
// is refused, at finish the block rides every call, a hold no call meets stands
// into the next turn, and a prompt landing mid-turn holds the session.
// [[spec/design_output/stop#the-hold]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { CHECK } from "../../.claude/skills/level0/lib/answer.js";
import { STOP_CALL } from "../../.claude/skills/level0/lib/stop.js";
import { REPORT_CALL } from "../../src/bridge/report.js";
import { dropsHold, holdsCall, sawCall, sawPrompt } from "../../src/bridge/stop.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const AT = join(ROOT, "spec", "config", "level0.json");
const LOCAL = join(ROOT, ".se", "config.json");

function box(hold) {
  const said = [];
  return {
    said,
    disk: fakeDisk({ [AT]: JSON.stringify({ stop: { enabled: true, hold } }) }),
    work: ROOT,
    method: ROOT,
    log: { say: (...row) => said.push(row) },
  };
}

// The sidebar writes the hold into the local config, and the tracked file carries the standing value. [[spec/design_output/config#the-three-layers]]
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
    assert.match(said.after.context[0], /holds this session at stop/, "and it carries the line");
  }
});

test("the hold at finish rides the block on every call, not on the first alone", () => {
  const it = box("finish");
  for (const tool of ["Bash", "Read", "Edit"]) {
    const said = holdsCall({ tool }, it);
    assert.match(
      said.after.context[0],
      /Put the work down/,
      `${tool} carries the line`,
    );
    assert.match(said.after.context[0], /start nothing new/);
  }
});

test("a hold no call meets stands into the next turn, and one a call meets drops", () => {
  const untouched = box("stop");
  dropsHold({}, untouched);
  assert.equal(held(untouched), "stop", "nothing met it, so it stands");

  const met = box("stop");
  holdsCall({ tool: "Bash" }, met);
  dropsHold({}, met);
  assert.equal(held(met), "off", "a call met it, so it drops");
});

test("a helper's call meets no hold", () => {
  assert.equal(holdsCall({ tool: "Bash", agentId: "a1" }, box("stop")), null);
});

// [[spec/design_output/stop#a-prompt-mid-turn-holds]]
test("a prompt landing while the agent runs tools holds the session at finish", () => {
  const it = box("off");
  sawCall({ tool: "Bash" }, it);
  sawPrompt({ text: "get to a point where you can push" }, it);
  assert.equal(held(it), "finish");
  assert.match(holdsCall({ tool: "Read" }, it).after.context[0], /Put the work down/);
});

test("a prompt opening a turn holds nothing, and a helper's prompt holds nothing", () => {
  const fresh = box("off");
  sawPrompt({ text: "merge the branches" }, fresh);
  assert.equal(held(fresh), "off", "no call stands before it");

  const helper = box("off");
  sawCall({ tool: "Bash" }, helper);
  sawPrompt({ text: "work one step", agentId: "a1" }, helper);
  assert.equal(held(helper), "off");
});

test("a turn's end puts the working flag down, so the next prompt opens a turn", () => {
  const it = box("off");
  sawCall({ tool: "Bash" }, it);
  dropsHold({}, it);
  sawPrompt({ text: "carry on" }, it);
  assert.equal(held(it), "off");
});
