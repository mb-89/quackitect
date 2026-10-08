// The gesture, replayed. Each case hands the press times in, so the burst that
// a person makes with a mouse runs here with no clock at all. How each write
// names the press stands in the sidebar test, which writes it to the log.
// [[spec/guidance/code/testing]] [[spec/design_output/extension#a-gesture-picks-a-state]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BURST, DEAD, fresh, pressed } from "../../src/extension/lib/gesture.js";

const HOLD = { options: ["off", "finish", "stop"], gesture: 5, value: "off" };
const FAR = ["finish", "stop"];

function burst(times, one = HOLD) {
  let state = fresh();
  const wrote = [];
  for (const at of times) {
    const said = pressed(state, at, one);
    state = said.state;
    if (said.writes !== undefined) wrote.push(said.writes);
  }
  return wrote;
}

test("a burst climbs one rung, its fifth press sends the far value, and a press past it acts again", () => {
  for (const [says, times, want, one = HOLD] of [
    ["the first press climbs one rung", [0], ["finish"]],
    ["the next two stand by", [0, 100, 200], ["finish"]],
    ["a press past the burst starts a new one", [0, BURST + 1], ["finish", "finish"]],
    ["a press at the burst's edge stands by", [0, BURST], ["finish"]],
    ["a fast hand reaches the far value", [0, 100, 200, 300, 400], FAR],
    ["a slow hand inside the window too", [0, 700, 1400, 2100, 2800], FAR],
    [
      "the window runs from the last press",
      [0, 700, 1400, 2100, 2800 + BURST + 1],
      ["finish", "finish"],
    ],
    [
      "a sixth press inside the dead moment undoes nothing",
      [0, 100, 200, 300, 400, 500],
      FAR,
    ],
    ["one after it acts", [0, 100, 200, 300, 400, 400 + DEAD], [...FAR, "finish"]],
    ["a press away from rest falls back", [0], ["off"], { ...HOLD, value: "finish" }],
    ["however far it stands", [0], ["off"], { ...HOLD, value: "stop" }],
    [
      "two options answer one press and never the fifth",
      [0, 200, 400, 600, 800],
      ["false"],
      { options: ["true", "false"], gesture: 5, value: true },
    ],
    ["no options write nothing", [0, 200, 400, 600, 800], [], { options: [] }],
  ])
    assert.deepEqual(burst(times, one), want, says);
});
