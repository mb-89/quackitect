// The battery's report against the one before, and each part's median over
// the kept runs, which a retro reads. The check's own report stands in Go.
// [[spec/guidance/retro/effect]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as battery from "../../src/scripts/battery.js";

const { batteryDelta } = battery;

test("a delta names each part's change, the cases new, grown and gone, the files, the unrun, the red and the spawns", () => {
  const before = {
    parts: { tests: 1000, go: 300 },
    total: 1300,
    slowest: [
      { name: "steady", ms: 100, file: "a.js" },
      { name: "grows", ms: 100, file: "a.js" },
      { name: "leaves", ms: 50, file: "b.js" },
    ],
    files: [{ name: "a.js", ms: 300 }],
    spawns: { all: 200, vale: 150 },
  };
  const now = {
    parts: { tests: 1500, go: 300, rules: 20 },
    total: 1820,
    slowest: [
      { name: "steady", ms: 120, file: "a.js" },
      { name: "grows", ms: 200, file: "a.js" },
      { name: "arrives", ms: 80, file: "b.js" },
    ],
    files: [
      { name: "a.js", ms: 400 },
      { name: "b.js", ms: 100 },
    ],
    unrun: ["rules"],
    red: [{ file: "a.js", name: "grows", said: "too slow" }],
    spawns: { all: 20, vale: 8 },
  };

  const said = batteryDelta(before, now);

  assert.deepEqual(said.total, { before: 1300, now: 1820 });
  assert.deepEqual(said.parts, [
    { part: "tests", before: 1000, now: 1500, delta: 500 },
    { part: "go", before: 300, now: 300, delta: 0 },
    { part: "rules", before: 0, now: 20, delta: 20 },
  ]);
  assert.deepEqual(said.fresh, [{ name: "arrives", ms: 80, file: "b.js" }]);
  assert.deepEqual(said.grown, [{ name: "grows", before: 100, ms: 200, file: "a.js" }]);
  assert.deepEqual(said.gone, [{ name: "leaves", ms: 50, file: "b.js" }]);
  assert.deepEqual(said.files, [
    { name: "a.js", before: 300, now: 400 },
    { name: "b.js", before: 0, now: 100 },
  ]);
  assert.deepEqual(said.unrun, ["rules"]);
  assert.deepEqual(said.red, now.red);
  assert.deepEqual(said.spawns, { before: before.spawns, now: now.spawns });
});

// A report from before this shape keys its cases on the name alone, and a case of that name reads as the same case. [[spec/guidance/retro/effect]]
test("a delta against no earlier report reads every part and case as new", () => {
  const said = batteryDelta(null, {
    parts: { tests: 5 },
    total: 5,
    slowest: [{ name: "a", ms: 5 }],
  });
  assert.deepEqual(said.parts, [{ part: "tests", before: 0, now: 5, delta: 5 }]);
  assert.deepEqual(said.fresh, [{ name: "a", ms: 5 }]);
  assert.deepEqual(said.gone, []);
  assert.deepEqual(said.files, []);
  assert.deepEqual(said.unrun, []);
  assert.deepEqual(said.red, []);
  assert.deepEqual(said.spawns, { before: null, now: null });
});

// One run reads the box's noise, so a retro reads each part's median over the kept runs. [[spec/guidance/retro/effect]]
test("three runs keep each part's median, and a part reads only off the runs that reached it", () => {
  assert.equal(typeof battery.medianParts, "function", "battery.js answers the median");
  const runs = [
    { tests: 100, go: 40, rules: 10 },
    { tests: 300, go: 60 },
    { tests: 200, go: 50, rules: 30 },
  ];
  assert.deepEqual(battery.medianParts(runs), { tests: 200, go: 50, rules: 20 });
  assert.deepEqual(battery.medianParts([{ tests: 7 }]), { tests: 7 });
  assert.deepEqual(battery.medianParts([]), {});
});
