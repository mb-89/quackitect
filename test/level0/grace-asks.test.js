// The owner's asks ride the grace: the update ask rides its calls before it
// blocks, and the finish hold rides its calls before it refuses like stop.
// [[spec/design_output/stop#the-grace]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { demands } from "../../src/bridge/answer.js";
import { asksForUpdate } from "../../src/bridge/ask.js";
import { dropsHold, holdsCall } from "../../src/bridge/stop.js";

const ROOT = "/tree";

function box(config) {
  const disk = fakeDisk({ [join(ROOT, "spec/config/level0.json")]: JSON.stringify(config) });
  return { disk, work: ROOT, method: ROOT, env: {}, log: { say: () => {} } };
}

// A demand takes its grace as the calls it skips, and one call where the caller names none. [[spec/design_output/stop#the-grace]]
test("a demand skips the calls its grace names, and one call by default", () => {
  const it = box({});
  demands(it, "The owner asks");
  assert.equal(it.demand.skips, 1);
  demands(it, "The owner asks", "", null, 3);
  assert.equal(it.demand.skips, 3);
  demands(it, "The owner asks", "", null, 0);
  assert.equal(it.demand.skips, 1, "a grace under one reads as one");
});

// [[spec/design_output/stop#the-grace]]
test("the update ask rides the calls the config names before it blocks", () => {
  const it = box({ ask: { wanted: "short" }, grace: { update: 5 } });
  asksForUpdate({ tool: "Read" }, it);
  assert.equal(it.demand.skips, 5, "the ask passes five calls with the block riding");
});

// [[spec/design_output/stop#the-grace]]
test("the finish hold passes its calls, then refuses the way the stop hold does", () => {
  const it = box({ stop: { hold: "finish" }, grace: { finish: 2 } });
  assert.ok(holdsCall({ tool: "Read" }, it).after, "the first call passes with the block");
  assert.ok(holdsCall({ tool: "Read" }, it).after, "the second call passes with the block");
  assert.match(holdsCall({ tool: "Read" }, it).result.deny, /refused/, "the third meets the refusal");
  assert.ok(holdsCall({ tool: "mcp__level0__stop" }, it).after, "the stop call passes");
  dropsHold({}, it);
  assert.equal(it.finishCalls, 0, "the turn's end starts the count over");
});
