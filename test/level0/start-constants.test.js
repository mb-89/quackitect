// The start road the bridgehead writes carries the span it waits on the
// index's standing, off the constant it exports, and no self-test of the
// bridge.
// [[spec/tickets/start-road-starts-the-index]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { START, STANDING_WAIT } from "../../.claude/skills/level0/hooks/start.js";
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

// A Windows box builds se-index.exe, so the road reads the binary with its suffix where it stands. [[spec/tickets/level0-smoke-runs-in-seconds]]
test("the start road takes the index binary with .exe where it stands", () => {
  assert.ok(START.includes("'.exe'"), "the start road names the Windows binary");
});

// [[spec/tickets/start-road-starts-the-index]]
test("the start road runs no self-test of the bridge", () => {
  assert.ok(
    !START.includes(`'${vehicle.SELF_TEST}'`),
    "the start road carries no flag",
  );
});
