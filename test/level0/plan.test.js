// The plan door over a fake box: the ask opens every so many calls, the third
// question stays away past the number, and one call answers all three.
// [[spec/design_output/stop#the-plan]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { reacted, wants } from "../../src/bridge/grace.js";
import {
  asksForPlan,
  dropsHandover,
  PLAN,
  PLAN_CALL,
  plansHere,
  TOOLS,
} from "../../src/bridge/plan.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

function box(files = {}) {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify({
      plan: { everyCalls: 10, mostOpen: 2, grace: 1 },
    }),
    ...files,
  });
  const said = [];
  return {
    said,
    disk,
    box: {
      disk,
      work: ROOT,
      method: ROOT,
      clock: fakeClock("2026-09-20T10:00:00.000Z"),
      log: { say: (...row) => said.push(row) },
    },
  };
}

const plan = TOOLS[PLAN_CALL];

// [[spec/design_output/stop#the-plan]]
test("one call adds todos at their place, finishes some, and names the work in hand", () => {
  const it = box();
  plan(
    {
      add: [
        { title: "read the note", details: "the one on the grace" },
        { title: "write the test", place: 1 },
      ],
    },
    it.box,
  );
  let held = plansHere(it.box);
  assert.deepEqual(
    held.todos.map((one) => `${one.title}:${one.todo}`),
    ["read the note:true", "write the test:true"],
  );
  plan({ working: "write the test", done: ["read the note"] }, it.box);
  held = plansHere(it.box);
  assert.equal(held.working, "write the test");
  // Finishing the thing in hand names it done, and the hand stands empty. [[spec/design_output/stop#the-plan]]
  plan({ done: ["write the test"] }, it.box);
  assert.equal(plansHere(it.box).working, "");
  assert.deepEqual(plansHere(it.box).todos, []);
  plan({ working: "write the test" }, it.box);
  assert.deepEqual(
    held.todos.map((one) => one.title),
    ["write the test"],
  );
  assert.ok(it.disk.exists(at(PLANS)), "the plan stands in the runtime file");
  // The plan carries the overrides a place writes, and an empty map where none stands. [[spec/design_output/pull#a-todo-forces-a-place]]
  assert.deepEqual(
    held.places,
    {},
    "the places stand as a map, empty until a place is written",
  );
});

// The todo tab shows the plan, so the log's count rides at debug. [[spec/design_output/stop#the-plan]]
test("the log's plan line names the count of todos alone, at debug", () => {
  const it = box();
  plan({ add: [{ title: "one" }], working: "one" }, it.box);
  plan({ add: [{ title: "two" }] }, it.box);
  const rows = it.said.filter((row) => row[1] === PLAN);
  assert.deepEqual(
    rows.map((row) => row[2]),
    ["the plan holds 1 todo", "the plan holds 2 todos"],
  );
  assert.ok(rows.every((row) => row[0] === "debug"));
});

// Past the number, a new todo stays out, and the answer says to finish one or write a ticket. [[spec/design_output/stop#the-plan]]
test("the open todos hold a number, and one past it stays out", () => {
  const it = box();
  plan({ add: [{ title: "one" }, { title: "two" }] }, it.box);
  const said = plan({ add: [{ title: "three", place: 2 }] }, it.box);
  assert.match(said.result.result, /three.*write a ticket/);
  assert.equal(plansHere(it.box).todos.length, 2);
});

// [[spec/design_output/stop#the-plan]]
test("the ask opens every so many calls, answers the tool, and drops its third question past the number", () => {
  const it = box();
  assert.equal(asksForPlan(it.box, 9), false);
  assert.equal(asksForPlan(it.box, 10), true);
  assert.equal(it.box.grace.tool, PLAN_CALL, "the ask names the call that answers it");
  assert.match(it.box.grace.react, /mcp__level0__plan/, "the ask says what answers it");
  assert.match(it.box.grace.why, /work on now.*finish.*add/);
  it.box.calls = 10;
  plan({ working: "the door" }, it.box);
  assert.equal(it.box.grace, null, "the call answers the ask");
  assert.equal(it.box.calls, 0, "the count starts over at an answer");
  plan({ add: [{ title: "one" }, { title: "two" }] }, it.box);
  assert.equal(asksForPlan(it.box, 20), true);
  assert.match(
    it.box.grace.why,
    /^You work on the door\. /,
    "the ask reminds of the work in hand",
  );
  assert.doesNotMatch(
    it.box.grace.why,
    /add/,
    "the third question stays away past the number",
  );
});

// A standing ask delays the plan's ask, which lands once that one is answered, because the count starts over at the answer alone. [[spec/design_output/stop#the-plan]]
test("the ask due behind another ask lands on the first call after that one is answered", () => {
  const it = box();
  assert.equal(
    wants(it.box, { id: "update", why: "an update", react: "report", calls: 5 }),
    true,
  );
  assert.equal(asksForPlan(it.box, 10), false, "another ask holds the grace");
  assert.equal(asksForPlan(it.box, 11), false, "and still holds it");
  reacted(it.box, "update");
  assert.equal(asksForPlan(it.box, 12), true, "the plan's ask lands on the next call");
  assert.equal(it.box.grace.id, PLAN);
  assert.equal(asksForPlan(it.box, 13), false, "one ask stands at a time");
});

// [[spec/design_output/work#one-handover-stands]]
test("the handover's own work leaves the plan, the word matched whole, and a plan without it stays unwritten", () => {
  const it = box({
    [at(PLANS)]: JSON.stringify({
      working: "write the Handover",
      todos: [
        { title: "the handover", details: "", todo: "end" },
        { title: "the handovers tab", details: "", todo: "end" },
      ],
      places: {},
    }),
  });

  assert.equal(dropsHandover(it.box), 2);
  const held = plansHere(it.box);
  assert.equal(held.working, "");
  assert.deepEqual(
    held.todos.map((one) => one.title),
    ["the handovers tab"],
  );

  const before = String(it.disk.read(at(PLANS)));
  assert.equal(dropsHandover(it.box), 0);
  assert.equal(String(it.disk.read(at(PLANS))), before);
});

// A handover todo stands from the context mark to the clear alone. [[spec/design_output/work#one-handover-stands]]
test("the plan takes a handover todo once the context mark is due, and drops one standing before", () => {
  const it = box({
    [at(PLANS)]: JSON.stringify({
      working: "write the handover",
      todos: [
        { title: "the handover", details: "", todo: "end" },
        { title: "the handovers tab", details: "", todo: "end" },
      ],
      places: {},
    }),
  });

  const early = plan(
    { add: [{ title: "write the handover" }, { title: "one" }] },
    it.box,
  );
  assert.match(early.result.result, /write the handover waits for the context mark/);
  let held = plansHere(it.box);
  assert.equal(held.working, "", "the handover in hand leaves before the mark");
  assert.deepEqual(
    held.todos.map((one) => one.title),
    ["the handovers tab", "one"],
  );

  plan({ working: "the handover" }, it.box);
  assert.equal(plansHere(it.box).working, "", "nor does it come back in hand");

  it.box.handover = { phase: "finish", asked: 0 };
  plan(
    {
      done: ["one"],
      add: [{ title: "write the handover" }],
      working: "write the handover",
    },
    it.box,
  );
  held = plansHere(it.box);
  assert.equal(held.working, "write the handover");
  assert.deepEqual(
    held.todos.map((one) => one.title),
    ["the handovers tab", "write the handover"],
  );
});
