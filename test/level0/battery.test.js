// The battery's report, read off a fixture: the slowest cases out of TAP, the
// parts as timed, and one report against the one before.
// [[spec/guidance/retro/effect]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { batteryDelta, batteryOf, partsTimed, slowestIn } from "../../src/scripts/battery.js";

test("the clock over the parts holds what each took, and hands each answer through", async () => {
  const clock = fakeClock("2026-01-01T00:00:00.000Z", 250);
  const { parts, timed } = partsTimed(clock);

  const said = await timed("tests", () => {
    clock.tick();
    return 0;
  });
  const red = await timed("rules", async () => {
    clock.tick(75);
    return 1;
  });

  assert.equal(said, 0);
  assert.equal(red, 1);
  assert.deepEqual(parts, { tests: 250, rules: 75 });
});

const TAP = [
  "TAP version 13",
  "# Subtest: test/level0/one.test.js",
  "    # Subtest: a fast case",
  "    ok 1 - a fast case",
  "      ---",
  "      duration_ms: 2.5",
  "      ...",
  "    # Subtest: a slow case",
  "    ok 2 - a slow case",
  "      ---",
  "      duration_ms: 900.25",
  "      ...",
  "ok 1 - test/level0/one.test.js",
  "  ---",
  "  duration_ms: 950.1",
  "  ...",
  "# Subtest: test/level0/two.test.js",
  "ok 2 - test/level0/two.test.js",
  "  ---",
  "  duration_ms: 40",
  "  ...",
  "1..2",
].join("\n");

test("the slowest cases come off the TAP, nested or not, slowest first", () => {
  assert.deepEqual(slowestIn(TAP, 3), [
    { name: "test/level0/one.test.js", ms: 950.1 },
    { name: "a slow case", ms: 900.25 },
    { name: "test/level0/two.test.js", ms: 40 },
  ]);
  assert.deepEqual(slowestIn("", 3), []);
});

test("a report carries each part rounded, their sum, and the slowest cases", () => {
  const said = batteryOf({ tests: 1200.6, go: 300.2, rules: 0 }, TAP, 2);
  assert.deepEqual(said.parts, { tests: 1201, go: 300, rules: 0 });
  assert.equal(said.total, 1501);
  assert.equal(said.slowest.length, 2);
});

test("a delta names each part's change, and the cases new, grown and gone", () => {
  const before = {
    parts: { tests: 1000, go: 300 },
    total: 1300,
    slowest: [
      { name: "steady", ms: 100 },
      { name: "grows", ms: 100 },
      { name: "leaves", ms: 50 },
    ],
  };
  const now = {
    parts: { tests: 1500, go: 300, rules: 20 },
    total: 1820,
    slowest: [
      { name: "steady", ms: 120 },
      { name: "grows", ms: 200 },
      { name: "arrives", ms: 80 },
    ],
  };

  const said = batteryDelta(before, now);

  assert.deepEqual(said.total, { before: 1300, now: 1820 });
  assert.deepEqual(said.parts, [
    { part: "tests", before: 1000, now: 1500, delta: 500 },
    { part: "go", before: 300, now: 300, delta: 0 },
    { part: "rules", before: 0, now: 20, delta: 20 },
  ]);
  assert.deepEqual(said.fresh, [{ name: "arrives", ms: 80 }]);
  assert.deepEqual(said.grown, [{ name: "grows", before: 100, ms: 200 }]);
  assert.deepEqual(said.gone, [{ name: "leaves", ms: 50 }]);
});

test("a delta against no earlier report reads every part and case as new", () => {
  const said = batteryDelta(null, {
    parts: { tests: 5 },
    total: 5,
    slowest: [{ name: "a", ms: 5 }],
  });
  assert.deepEqual(said.parts, [{ part: "tests", before: 0, now: 5, delta: 5 }]);
  assert.deepEqual(said.fresh, [{ name: "a", ms: 5 }]);
  assert.deepEqual(said.gone, []);
});
