// The stamp the check writes: the battery run in order and timed, what the
// stamp says of the run, and the battery's report riding it where one stands.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { REFACTORS, STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { batteryRun, stampFor } from "../../src/scripts/cli-stamp.js";

const AT = "2026-09-20T10:00:00.000Z";

// [[spec/guidance/retro/effect]]
test("the battery runs its parts in order, times each, and stops at the first red", async () => {
  const clock = fakeClock(AT, 100);
  const ran = [];
  const step = (name, code) => [
    name,
    () => {
      ran.push(name);
      clock.tick();
      return code;
    },
  ];

  const green = await batteryRun([step("tests", 0), step("rules", undefined)], clock);
  assert.deepEqual(green, { code: 0, parts: { tests: 100, rules: 100 }, unrun: [] });

  ran.length = 0;
  const red = await batteryRun(
    [step("tests", 0), step("go", 1), step("rules", 0)],
    clock,
  );
  assert.equal(red.code, 1);
  assert.deepEqual(ran, ["tests", "go"], "a red part stops the run");
  assert.deepEqual(Object.keys(red.parts), ["tests", "go"]);
  assert.deepEqual(red.unrun, ["rules"], "the stamp names what the red left unrun");
});

test("a green run stamps ok with no warning, and a red run stamps the code", () => {
  const green = stampFor({ code: 0, sha: "abc", clean: true, at: AT });
  assert.deepEqual(green, {
    sha: "abc",
    ok: true,
    clean: true,
    at: AT,
    warnings: 0,
    files: [],
  });

  const red = stampFor({ code: 1, sha: "abc", clean: false, at: AT });
  assert.equal(red.ok, false);
  assert.equal(red.clean, false);
  // The list stands in its own file beside the stamp, because the hand changes what it names. [[spec/design_output/stop#the-grace]]
  assert.match(REFACTORS, /refactor\.json$/);
  assert.equal(REFACTORS.slice(0, REFACTORS.lastIndexOf("/")), STAMP.slice(0, STAMP.lastIndexOf("/")), "the list stands in the stamp's folder");
});

// [[spec/guidance/retro/effect]]
test("the battery's report rides the stamp where one stands, and no field stands where none does", () => {
  const battery = { parts: { tests: 12 }, total: 12, slowest: [] };
  assert.deepEqual(
    stampFor({ code: 0, sha: "abc", clean: true, at: AT, battery }).battery,
    battery,
  );
  assert.equal(
    "battery" in stampFor({ code: 0, sha: "abc", clean: true, at: AT }),
    false,
  );
});

// The stamp keeps the last runs at its own commit, so a retro reads a median over one tree. [[spec/guidance/retro/effect]]
test("the stamp keeps the last runs' parts at its commit, up to the count, and drops another commit's", () => {
  const battery = { parts: { tests: 30 }, total: 30, slowest: [] };
  const before = { sha: "abc", runs: [{ tests: 20 }, { tests: 10 }] };

  const kept = stampFor({ code: 0, sha: "abc", clean: true, at: AT, battery, before, keep: 3 });
  assert.deepEqual(kept.runs, [{ tests: 30 }, { tests: 20 }, { tests: 10 }]);

  const capped = stampFor({ code: 0, sha: "abc", clean: true, at: AT, battery, before, keep: 2 });
  assert.deepEqual(capped.runs, [{ tests: 30 }, { tests: 20 }], "the count caps the runs");

  const moved = stampFor({ code: 0, sha: "def", clean: true, at: AT, battery, before, keep: 3 });
  assert.deepEqual(moved.runs, [{ tests: 30 }], "a run of another commit drops");

  assert.equal("runs" in stampFor({ code: 0, sha: "abc", clean: true, at: AT, before }), false);
});
