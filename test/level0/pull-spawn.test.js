// The prompt the pull hands a hand of its own, and nothing else: the unblock
// prompt served no road a shipped route reaches, so it leaves.
// [[spec/tickets/every-road-has-a-caller]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as spawn from "../../src/scripts/pull-spawn.js";

// [[spec/tickets/every-road-has-a-caller]]
test("the module words the spawn prompt alone, and holds no unblock prompt", () => {
  assert.deepEqual(Object.keys(spawn).sort(), ["HELPER", "SPAWN", "spawnPrompt"]);
  const said = spawn.spawnPrompt(
    "a-child",
    { path: "design/review", evidence: [{ name: "verdict", form: "verdict" }] },
    "helper-2",
  );
  assert.match(said, /named helper-2/);
  assert.match(said, /a-child at design\/review/);
});
