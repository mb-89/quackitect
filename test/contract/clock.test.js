// The clock door, against the real clock. A test above this one hands in the
// fake, so a case replays at the same instant every run.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { clock } from "../../src/doors/clock.js";
import { fakeClock } from "../../src/doors/fake/clock.js";

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const shaped = (door) => ({
  now: door.now() instanceof Date,
  stamp: ISO.test(door.stamp()),
  agrees: door.stamp().slice(0, 10) === door.now().toISOString().slice(0, 10),
  ms: Number.isFinite(door.ms()),
  after: typeof door.after(0, () => {}).cancel,
  wait: door.wait(0) instanceof Promise,
});

test("the real clock answers a date and the stamp it prints", () => {
  const said = clock();
  assert.ok(said.now() instanceof Date);
  assert.match(said.stamp(), ISO);
});

test("the fake answers what the real clock answers", () => {
  assert.deepEqual(shaped(fakeClock()), shaped(clock()));
});

test("the real clock fires a timer once its span passes, and a cancel holds it", async () => {
  const said = clock();
  const fired = [];
  said.after(0, () => fired.push("kept"));
  said.after(0, () => fired.push("cancelled")).cancel();
  await said.wait(5);
  assert.deepEqual(fired, ["kept"]);
});

test("the fake fires each timer in order once a tick passes its span, and no sooner", async () => {
  const said = fakeClock("2026-01-01T00:00:00.000Z");
  const fired = [];
  said.after(2000, () => fired.push("late"));
  said.after(1000, () => fired.push("early"));
  said.after(1500, () => fired.push("cancelled")).cancel();
  const waited = said.wait(1000).then(() => fired.push("waited"));
  said.tick(999);
  await Promise.resolve();
  assert.deepEqual(fired, []);
  said.tick(1001);
  await waited;
  assert.deepEqual(fired, ["early", "late", "waited"]);
  assert.equal(said.ms(), new Date("2026-01-01T00:00:02.000Z").getTime());
});

test("the fake stands still until a test moves it", () => {
  const said = fakeClock("2026-01-01T00:00:00.000Z");
  assert.equal(said.stamp(), "2026-01-01T00:00:00.000Z");
  assert.equal(said.stamp(), "2026-01-01T00:00:00.000Z");
  said.tick(1000);
  assert.equal(said.stamp(), "2026-01-01T00:00:01.000Z");
});
