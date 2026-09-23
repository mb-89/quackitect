// The start road the bridgehead writes carries the flag and the span the
// server reads, off one file both import.
// [[spec/tickets/a-count-meets-the-lint]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { START } from "../../.claude/skills/level0/hooks/level0.js";
import * as vehicle from "../../.claude/skills/level0/lib/vehicle.js";
import * as reload from "../../src/bridge/reload.js";

// [[spec/tickets/a-count-meets-the-lint]]
test("the start road spells the self-test flag and its span off the file the server reads", () => {
  assert.equal(typeof vehicle.SELF_TEST, "string", "the flag stands in lib/vehicle.js");
  assert.equal(typeof vehicle.TESTING, "number", "the span stands in lib/vehicle.js");
  assert.equal(reload.SELF_TEST, vehicle.SELF_TEST, "the server reads the same flag");
  assert.ok(START.includes(`'${vehicle.SELF_TEST}'`), "the start road carries the flag");
  assert.ok(START.includes(`timeout: ${vehicle.TESTING}`), "the start road carries the span");
});
