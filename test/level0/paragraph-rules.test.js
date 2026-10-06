// The table rule keys each run of words its layer names once, as the Go
// twin writes it, so its cost grows with the words a file holds.
// [[spec/tickets/the-parts-start-at-once]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { restatedTable } from "../../.claude/skills/level0/lib/paragraph-rules.js";

test("the table rule keys the runs its layer names, and searches no pair of words", () => {
  const said = restatedTable({ table: 4, prose: [] });

  for (const want of ["runs(wordsOf(one), 4)", "runs(wordsOf(row.said), 4)", "if shared[key] {"])
    assert.ok(said.includes(want), `the rule lacks ${want}`);
  assert.ok(!said.includes("for j := 0"), "the rule still searches every pair of words");
});
