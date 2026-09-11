// The gesture, replayed. Each case hands the press times in, so the burst that
// a person makes with a mouse runs here with no clock at all.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BURST, fresh, pressed } from "../../src/extension/webview/gesture.js";

const HOLD = {
  options: ["running", "finishing", "stopped"],
  gesture: 5,
  value: "running",
};

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

test("the first press of a burst climbs one rung, and the next two stand by", () => {
  assert.deepEqual(burst([0]), ["finishing"]);
  assert.deepEqual(burst([0, 100, 200]), ["finishing"]);
});

test("a press past the burst starts a new one, and acts again", () => {
  assert.deepEqual(burst([0, BURST + 1]), ["finishing", "finishing"]);
  assert.deepEqual(burst([0, BURST]), ["finishing"]);
});

test("the fifth press of a burst sends the far value", () => {
  assert.deepEqual(burst([0, 200, 400, 600, 800]), ["finishing", "stopped"]);
});

// [[spec/design_output/extension#a-gesture-picks-a-state]]
test("a person clicking fast reaches the far value, at any speed they hold", () => {
  assert.deepEqual(burst([0, 100, 200, 300, 400]), ["finishing", "stopped"]);
  assert.deepEqual(burst([0, 700, 1400, 2100, 2800]), ["finishing", "stopped"]);
});

test("the window runs from the last press, so a slow hand still counts", () => {
  assert.deepEqual(burst([0, 700, 1400, 2100, 2800 + BURST + 1]), ["finishing", "finishing"]);
});

test("a press away from rest falls back to rest, however far it stands", () => {
  assert.deepEqual(burst([0], { ...HOLD, value: "finishing" }), ["running"]);
  assert.deepEqual(burst([0], { ...HOLD, value: "stopped" }), ["running"]);
});

test("a control holding two options answers one press and never the fifth", () => {
  const two = { options: ["true", "false"], gesture: 5, value: "true" };
  assert.deepEqual(burst([0, 200, 400, 600, 800], two), ["false"]);
});

test("a widget naming no options writes nothing", () => {
  assert.deepEqual(burst([0, 200, 400, 600, 800], { options: [] }), []);
});
