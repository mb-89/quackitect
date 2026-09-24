// The battery's report, read off a fixture: the slowest cases and the files
// out of the reporter's lines, the parts as timed, and one report against the
// one before.
// [[spec/guidance/retro/effect]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";

const { batteryDelta, batteryOf, filesIn, partsTimed, redIn, slowestIn, spawnsIn } = battery;
import * as battery from "../../src/scripts/battery.js";

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

// The lines the runner's reporter writes, one a case. [[spec/design_output/work#the-battery-answers-first]]
const line = (row) => JSON.stringify(row);
const LINES = [
  line({ file: "test/level0/one.test.js", name: "a fast case", nesting: 0, ms: 2.5, ok: true }),
  line({ file: "test/level0/one.test.js", name: "a slow case", nesting: 0, ms: 900.25, ok: true }),
  line({ file: "test/level0/one.test.js", name: "inside a group", nesting: 1, ms: 30, ok: true }),
  line({ file: "test/level0/one.test.js", name: "a group", nesting: 0, ms: 47.25, ok: true }),
  line({ file: "test/level0/two.test.js", name: "a case", nesting: 0, ms: 40, ok: true }),
  "",
  "not a row",
].join("\n");

test("the slowest cases come off the lines, slowest first, each with its file", () => {
  assert.deepEqual(slowestIn(LINES, 3), [
    { name: "a slow case", ms: 900.25, file: "test/level0/one.test.js" },
    { name: "a group", ms: 47.25, file: "test/level0/one.test.js" },
    { name: "a case", ms: 40, file: "test/level0/two.test.js" },
  ]);
  assert.deepEqual(slowestIn("", 3), []);
});

// A group's time holds its children, so a file sums its cases at the top alone. [[spec/guidance/retro/effect]]
test("a time a test file sums its cases at the top, the slowest first", () => {
  assert.deepEqual(filesIn(LINES), [
    { name: "test/level0/one.test.js", ms: 950 },
    { name: "test/level0/two.test.js", ms: 40 },
  ]);
});

const RED_LINES = [
  line({
    file: "test/contract/stub.test.js",
    name: "a stub holds its files",
    nesting: 0,
    ms: 13.8,
    ok: false,
    said: "ENOENT: no such file or directory, open '/tree/plugin.json'",
  }),
  line({ file: "test/contract/stub.test.js", name: "the shim hands a verb", nesting: 0, ms: 6.2, ok: true }),
].join("\n");

// [[spec/guidance/retro/effect]]
test("a red case comes off the lines in its own words", () => {
  assert.deepEqual(redIn(RED_LINES), [
    {
      file: "test/contract/stub.test.js",
      name: "a stub holds its files",
      said: "ENOENT: no such file or directory, open '/tree/plugin.json'",
    },
  ]);
  assert.deepEqual(redIn(LINES), []);
});

// [[spec/guidance/retro/effect]]
test("the tally counts a line a spawn, and the ones that are Vale", () => {
  const tally = [
    "/tree/.se/.runtime/bin/vale",
    "/usr/bin/node",
    "C:\\tree\\.se\\.runtime\\bin\\vale.exe",
    "sh",
    "",
  ].join("\n");
  assert.deepEqual(spawnsIn(tally), { all: 4, vale: 2 });
  assert.deepEqual(spawnsIn(""), { all: 0, vale: 0 });
});

test("a report carries each part rounded, their sum, the slowest cases, the files, the parts unrun, the red and the spawns", () => {
  const said = batteryOf(
    { tests: 1200.6, go: 300.2, rules: 0 },
    RED_LINES,
    { most: 1, unrun: ["go", "rules"], spawns: { all: 4, vale: 2 } },
  );
  assert.deepEqual(said.parts, { tests: 1201, go: 300, rules: 0 });
  assert.equal(said.total, 1501);
  assert.equal(said.slowest.length, 1);
  assert.deepEqual(said.files, [{ name: "test/contract/stub.test.js", ms: 20 }]);
  assert.deepEqual(said.unrun, ["go", "rules"]);
  assert.equal(said.red.length, 1);
  assert.deepEqual(said.spawns, { all: 4, vale: 2 });

  const bare = batteryOf({ tests: 5 }, LINES);
  assert.deepEqual(bare.unrun, []);
  assert.equal(bare.spawns, null);
});

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
