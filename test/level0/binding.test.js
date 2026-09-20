// The engine binding, read by the pull and by the stop hook: which value hands
// work out, and which checks stand down where the engine steps aside.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import * as stop from "../../src/bridge/stop.js";
import * as route from "../../src/scripts/pull-route.js";
import { probeOf, startOf } from "../../src/scripts/serve.js";
import { pulling } from "../../src/scripts/work.js";
import { doors, heard, ROOT, standing } from "./pull-doors.js";

const { handsOut } = route;
const { ENGINE_CHECKS, standsDown } = stop;

// The shipped rules own these names, and a contract case holds the list against them. [[spec/design_output/stop#the-mechanical-checks]]
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

const onTrunk = { "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } };

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

test("the list names the four, and the stop rules name each of them", () => {
  assert.deepEqual([...(ENGINE_CHECKS ?? [])].sort(), [
    "group-in-hand",
    "ticket-in-hand",
    "warnings-standing",
    "work-waiting",
  ]);
  for (const name of ENGINE_CHECKS ?? []) assert.ok(EVERY.includes(name), name);
});

test("the gate answers every name this list holds, and the gate names fewer", () => {
  assert.ok(EVERY.length > (ENGINE_CHECKS ?? []).length, "the door answers more than the gate");
  for (const name of EVERY) assert.equal(typeof standsDown(name, "queue"), "boolean", name);
});

// The pull hands out at the queue alone, on every road. [[spec/design_output/config#the-engine-controls]]
test("a cloud box on trunk takes no branch at god, and says what binds it", () => {
  const { it } = doors(standing(), onTrunk, { cloud: true, binding: "god" });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.match(said, /binds to god/);
  assert.ok(!said.includes("branch stands at todo"), "the take stands untouched");
});

test("a cloud box on trunk reaches the take at the queue", () => {
  const held = doors(standing(), onTrunk, { cloud: true, binding: "queue" });
  for (const [argv, code] of [
    [probeOf("node", 6510), 1],
    [startOf(ROOT), 0],
  ])
    held.outside.proc.teach(argv, { exitCode: code });
  const { said } = heard(() => pulling(ROOT, ["pull"], held.it));
  assert.ok(!said.includes("binds to"), said);
  assert.match(said, /branch stands at todo|took|holds it/);
});

test("a pull at unbound hands nothing out, and names the road back", () => {
  const { it } = doors(standing(), onTrunk, { cloud: true, binding: "unbound" });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.match(said, /binds to unbound/);
  assert.match(said, /Name a ticket/);
});
