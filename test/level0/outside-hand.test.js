// The environment rides the hand a root builds, and every module past one reads
// it there. Each case here hands its own map in, so none touches the box it
// runs on.
// [[spec/design_output/doors#a-door-reads-the-outside]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { registerDirs } from "../../src/scripts/vehicle.js";

test("the register splits its list the way the caller says", () => {
  const env = { SE_REGISTRY: "/one;/two" };
  assert.deepEqual(registerDirs(env, true), ["/one", "/two"]);
  assert.deepEqual(registerDirs(env, false), ["/one;/two"]);
  assert.deepEqual(registerDirs({ SE_REGISTRY: "/one:/two" }), ["/one", "/two"]);
});

