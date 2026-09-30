// A verb's argv names node, its program under the verbs folder, and the words
// past the verb.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { verbArgv } from "../../src/scripts/verb-run.js";

test("verbArgv answers node, the program and the words", () => {
  assert.deepEqual(verbArgv("node", "/tree", ["check", "--errors"]), [
    "node",
    join("/tree", "src", "scripts", "verbs", "check.js"),
    "--errors",
  ]);
});
