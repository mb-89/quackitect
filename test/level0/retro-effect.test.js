// The effect step's battery reading: this retro's report against the last
// retro's, off the files collect keeps under each retro's home.
// [[spec/guidance/retro/effect]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { RETRO } from "../../.claude/skills/level0/lib/folders.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { BATTERY, batteryEffect } from "../../src/engine/retro/effect.js";

const ROOT = "/tree";
const at = (retro) => join(ROOT, ...RETRO.split("/"), retro, BATTERY);
const box = (files) => ({ root: ROOT, disk: fakeDisk(files), join });

const earlier = {
  parts: { tests: 1000, rules: 200 },
  total: 1200,
  slowest: [
    { name: "steady", ms: 100 },
    { name: "leaves", ms: 60 },
  ],
};
const later = {
  parts: { tests: 1400, rules: 200 },
  total: 1600,
  slowest: [
    { name: "steady", ms: 110 },
    { name: "arrives", ms: 90 },
  ],
};

test("the effect reads this retro's battery against the last retro's", () => {
  const it = box({
    [at("retro-b")]: JSON.stringify(later),
    [at("retro-a")]: JSON.stringify(earlier),
  });

  const said = batteryEffect(it, "retro-b", "retro-a");

  assert.equal(said.last, "retro-a");
  assert.deepEqual(said.total, { before: 1200, now: 1600 });
  assert.deepEqual(said.fresh, [{ name: "arrives", ms: 90 }]);
  assert.deepEqual(said.gone, [{ name: "leaves", ms: 60 }]);
  assert.deepEqual(said.slowest, later.slowest);
});

test("a retro with no earlier one reads every part as new, and no report reads as nothing", () => {
  const alone = box({ [at("retro-b")]: JSON.stringify(later) });
  const said = batteryEffect(alone, "retro-b", "");
  assert.equal(said.last, "");
  assert.deepEqual(
    said.parts.map((one) => one.before),
    [0, 0],
  );

  assert.equal(batteryEffect(box({}), "retro-b", "retro-a"), null);
});
