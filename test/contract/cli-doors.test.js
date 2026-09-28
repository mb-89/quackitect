// The doors every verb builds read the size cap off the one config, so the
// pull splits at the cap the tracked file names.
// [[spec/design_input/level-two#the-size-cap]]

import assert from "node:assert/strict";
import { test } from "node:test";
import said from "../../spec/config/level0.json" with { type: "json" };
import { it } from "../../src/scripts/cli-doors.js";

// [[spec/design_input/level-two#the-size-cap]]
test("the doors carry the cap and its margin the config names", () => {
  const env = process.env;
  const bytes = Number(env.SE_PULL_CAP || said.pull.cap);
  const margin = Number(env.SE_PULL_MARGIN || said.pull.margin);
  assert.equal(Number(it.cap.bytes), bytes);
  assert.equal(Number(it.cap.margin), margin);
});

// [[spec/tickets/serve-probes-the-register-port]]
test("the doors carry the process id and the platform, as the listen reads the register", () => {
  assert.equal(it.pid, process.pid);
  assert.equal(it.windows, process.platform === "win32");
});
