// The start road the bridgehead writes carries the span it waits on the
// index's standing, off the constant it exports, and no self-test of the
// bridge.
// [[spec/tickets/start-road-starts-the-index]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { STANDING_WAIT, START } from "../../.claude/skills/level0/hooks/start.ts";
import * as vehicle from "../../.claude/skills/level0/lib/vehicle.js";

// [[spec/tickets/start-road-starts-the-index]]
test("the start road waits on the index's standing for the span it exports", () => {
  assert.equal(typeof STANDING_WAIT, "number");
  assert.ok(
    START.includes(`timeout: ${STANDING_WAIT}`),
    "the start road carries the span",
  );
  assert.ok(START.includes("['standing']"), "the start road runs the index standing");
});

// [[spec/tickets/start-road-starts-the-index]]
test("the start road runs no self-test of the bridge", () => {
  assert.ok(
    !START.includes(`'${vehicle.SELF_TEST}'`),
    "the start road carries no flag",
  );
});
