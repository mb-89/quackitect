// The battery report collect keeps for a retro: each part's median over the
// runs the stamp holds, beside the last run's cases and files.
// [[spec/guidance/retro/effect]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { keptReport } from "../../src/scripts/retro-collect.js";

const LAST = {
  parts: { tests: 300, rules: 30 },
  total: 330,
  slowest: [{ name: "a slow case", ms: 90, file: "a.js" }],
  files: [{ name: "a.js", ms: 90 }],
};

test("collect keeps each part's median over the stamp's runs, and the last run's cases and files", () => {
  const said = keptReport({
    battery: LAST,
    runs: [{ tests: 300, rules: 30 }, { tests: 100 }, { tests: 200, rules: 10 }],
  });
  assert.deepEqual(said.parts, { tests: 200, rules: 20 });
  assert.equal(said.total, 220);
  assert.equal(said.runs, 3);
  assert.deepEqual(said.slowest, LAST.slowest);
  assert.deepEqual(said.files, LAST.files);
});

test("a stamp from before the runs reads its one report, and no report reads as nothing", () => {
  assert.deepEqual(keptReport({ battery: LAST }).parts, LAST.parts);
  assert.equal(keptReport({ battery: LAST }).runs, 1);
  assert.equal(keptReport({}), null);
  assert.equal(keptReport(null), null);
});
