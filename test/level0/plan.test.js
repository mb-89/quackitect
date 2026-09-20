// The plan door over a fake box: the ask opens every so many calls, the third
// question stays away past the number, and one call answers all three.
// [[spec/design_output/stop#the-plan]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { asksForPlan, PLAN_CALL, plansHere, TOOLS } from "../../src/bridge/plan.js";

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
  assert.deepEqual(
    held.todos.map((one) => one.title),
    ["write the test"],
  );
  assert.ok(it.disk.exists(at(PLANS)), "the plan stands in the runtime file");
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
  plan({ working: "the door" }, it.box);
  assert.equal(it.box.grace, null, "the call answers the ask");
  plan({ add: [{ title: "one" }, { title: "two" }] }, it.box);
  assert.equal(asksForPlan(it.box, 20), true);
  assert.doesNotMatch(
    it.box.grace.why,
    /add/,
    "the third question stays away past the number",
  );
});
