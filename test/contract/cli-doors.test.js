// The doors every verb builds read the size cap off the one config, so the
// pull splits at the cap the tracked file names.
// [[spec/design_input/level-two#the-size-cap]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { underBuiltIns } from "../../.claude/skills/level0/lib/config.js";
import file from "../../spec/config/level0.json" with { type: "json" };
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import * as doors from "../../src/scripts/cli-doors.js";
import { it } from "../../src/scripts/cli-doors.js";

const said = underBuiltIns(schema, file);

// [[spec/design_input/level-two#the-size-cap]]
test("the doors carry the cap and its margin the config names", () => {
  const env = process.env;
  const bytes = Number(env.SE_PULL_CAP || said.pull.cap);
  const margin = Number(env.SE_PULL_MARGIN || said.pull.margin);
  assert.equal(Number(it.cap.bytes), bytes);
  assert.equal(Number(it.cap.margin), margin);
});

// The names only the ported verbs read leave the doors with them. [[spec/tickets/config-verbs-accept-points]]
test("the doors export none of the names the ported verbs alone read", () => {
  for (const name of ["STYLES", "SHAPE", "SCRIPTED", "GUIDANCE", "ROUNDS"]) {
    assert.equal(name in doors, false, `${name} stands in cli-doors.js`);
  }
});

// [[spec/tickets/serve-probes-the-register-port]]
test("the doors carry the process id and the platform, as the listen reads the register", () => {
  assert.equal(it.pid, process.pid);
  assert.equal(it.windows, process.platform === "win32");
});

// [[spec/tickets/readers-name-one-mode-source]]
test("the doors carry the mode of each slice a reader takes a Go topic for", () => {
  for (const slice of ["config", "log", "guidance", "check", "prose"]) {
    assert.equal(it.slices[slice], said.migration[slice], `slices.${slice}`);
  }
});

// [[spec/tickets/readers-name-one-mode-source]]
test("the doors name every migration key the schema types as a string, and no other", () => {
  const keys = schema.properties.migration.properties;
  const modes = Object.keys(keys).filter((one) => keys[one].type === "string");
  assert.deepEqual(Object.keys(it.slices), modes);
  assert.equal("phase0" in it.slices, false, "a boolean phase switch reads as no slice");
});
