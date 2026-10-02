// The check's budget, read off the config door the check runs on.
// [[spec/tickets/the-check-runs-fast-again]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { budgetOf } from "../../src/scripts/check-verb.js";

test("the check's budget reads battery.budget, and no key reads as no budget", async () => {
  const asked = [];
  const config = (said) => ({
    ask: async (key) => {
      asked.push(key);
      return said;
    },
  });

  assert.equal(await budgetOf(config(90000)), 90000);
  assert.equal(await budgetOf(config(undefined)), 0);
  assert.deepEqual(asked, ["battery.budget", "battery.budget"]);
});
