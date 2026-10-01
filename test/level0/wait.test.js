// The wait tool, on a fake clock: a helper's report, an output's end and a
// quiet file set each return it, and the cap returns it where none comes.
// [[spec/design_output/level0#the-wait-returns-on-signals]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { SPECS, WAIT, WAIT_CALL } from "../../src/bridge/wait.js";

test("the spec names the wait and the three signals it takes", () => {
  const [spec] = SPECS();
  assert.equal(spec.name, WAIT);
  assert.equal(WAIT_CALL, "mcp__level0__wait");
  assert.deepEqual(Object.keys(spec.inputSchema.properties), [
    "agent",
    "output",
    "pid",
    "files",
  ]);
});
