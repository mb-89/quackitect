// The engine binding, read by the pull and by the stop hook: which value hands
// work out, and which checks stand down where the engine steps aside.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import * as stop from "../../src/bridge/stop.js";
import * as route from "../../src/scripts/pull-route.js";

const { handsOut } = route;
const { ENGINE_CHECKS, standsDown } = stop;

// Every check the stop door answers, so a new one joins one list or the other.
const EVERY = [
  "stop-hook-off",
  "owner-holds",
  "owner-finishes",
  "chat-is-new",
  "work-waiting",
  "group-in-hand",
  "ticket-in-hand",
  "queue-waits",
  "no-stop-line",
  "a-person-sits-here",
  "warnings-standing",
];

// [[spec/design_output/config#the-engine-controls]]
test("the plain pull hands work out at the queue alone", () => {
  assert.equal(typeof handsOut, "function", "pull-route.js answers handsOut");
  assert.equal(handsOut("queue"), true);
  assert.equal(handsOut("unbound"), false);
  assert.equal(handsOut("god"), false);
});

test("a binding the config leaves unsaid hands work out", () => {
  assert.equal(typeof handsOut, "function", "pull-route.js answers handsOut");
  assert.equal(handsOut(""), true);
  assert.equal(handsOut(undefined), true);
});

// [[spec/design_output/config#the-engine-controls]]
test("the checks reading the engine's own work stand down at god", () => {
  assert.equal(typeof standsDown, "function", "stop.js answers standsDown");
  const wanted = [
    "ticket-in-hand",
    "group-in-hand",
    "work-waiting",
    "warnings-standing",
  ];
  for (const name of wanted) assert.equal(standsDown(name, "god"), true, name);
});

test("those same checks hold at the queue and at unbound", () => {
  assert.equal(typeof standsDown, "function", "stop.js answers standsDown");
  for (const name of ENGINE_CHECKS ?? []) {
    assert.equal(standsDown(name, "queue"), false, name);
    assert.equal(standsDown(name, "unbound"), false, name);
  }
});

test("every other check holds at god, because it reads something else", () => {
  assert.equal(typeof standsDown, "function", "stop.js answers standsDown");
  const held = new Set(ENGINE_CHECKS ?? []);
  for (const name of EVERY.filter((one) => !held.has(one))) {
    assert.equal(standsDown(name, "god"), false, name);
  }
});

test("the list names the four, and the stop door answers each of them", () => {
  assert.deepEqual([...(ENGINE_CHECKS ?? [])].sort(), [
    "group-in-hand",
    "ticket-in-hand",
    "warnings-standing",
    "work-waiting",
  ]);
  for (const name of ENGINE_CHECKS ?? []) assert.ok(EVERY.includes(name), name);
});
