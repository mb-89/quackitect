// The rows the branch verb prints as its usage, read with no door standing.
// [[spec/design_output/work#the-round-trip]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { USAGE } from "../../src/scripts/work-usage.js";

const verbs = () => USAGE.slice(1).map((row) => row.trim().split(/\s+/)[0]);

// The work tab reads the index, so no verb writes an answer file. [[spec/design_output/work#one-reading-answers-git]]
test("the usage names no answer verb, because the index answers the tab", () => {
  assert.equal(verbs().includes("answer"), false);
});

test("the usage names the verbs a branch takes, one a row", () => {
  for (const one of ["open", "take", "sync", "done", "list", "merge", "close", "test"]) {
    assert.ok(verbs().includes(one), `${one} stands in the usage`);
  }
});
