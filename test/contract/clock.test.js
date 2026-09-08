// The clock door, against the real clock. A test above this one hands in the
// fake, so a case replays at the same instant every run.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { clock } from "../../src/doors/clock.js";
import { fakeClock } from "../../src/doors/fake/clock.js";

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const shaped = (door) => ({
  now: door.now() instanceof Date,
  stamp: ISO.test(door.stamp()),
  agrees: door.stamp().slice(0, 10) === door.now().toISOString().slice(0, 10),
});

test("the real clock answers a date and the stamp it prints", () => {
  const said = clock();
  assert.ok(said.now() instanceof Date);
  assert.match(said.stamp(), ISO);
});

test("the fake answers what the real clock answers", () => {
  assert.deepEqual(shaped(fakeClock()), shaped(clock()));
});

test("the fake stands still until a test moves it", () => {
  const said = fakeClock("2026-01-01T00:00:00.000Z");
  assert.equal(said.stamp(), "2026-01-01T00:00:00.000Z");
  assert.equal(said.stamp(), "2026-01-01T00:00:00.000Z");
  said.tick(1000);
  assert.equal(said.stamp(), "2026-01-01T00:00:01.000Z");
});
