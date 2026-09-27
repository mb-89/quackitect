// The tests a process lists as red: a ticket past tests-red and short of
// tests-green names them, and the check reads them apart.
// [[spec/design_output/pull#the-gate]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedRed } from "../../src/scripts/red-list.js";

const TICKET = (record) => `---
kind: [[ticket]]
state: open
step: implement/change
steps:
  - name: design
    steps:
      - name: tests-red
        evidence:
          - name: red
            form: list
            says: the test files standing red
  - name: implement
    steps:
      - name: change
      - name: tests-green
record:
${record}---

# Ask

One piece of it.

# design

## tests-red

### red

- test/level0/one.test.js
- test/level0/two.test.js

# implement

## change

## tests-green

# Discussion
`;

const PAST_RED = "  - step: design/tests-red\n    hand: box one\n";
const GREEN = "  - step: implement/tests-green\n    hand: box one\n";

// [[spec/design_output/pull#the-gate]]
test("the red list holds a ticket past tests-red, and drops it at tests-green", () => {
  assert.deepEqual(expectedRed([{ name: "a-child", text: TICKET(PAST_RED) }]), [
    "test/level0/one.test.js",
    "test/level0/two.test.js",
  ]);
  assert.deepEqual(
    expectedRed([{ name: "a-child", text: TICKET(PAST_RED + GREEN) }]),
    [],
  );
  assert.deepEqual(
    expectedRed([{ name: "a-child", text: TICKET("  - step: design/draft\n") }]),
    [],
  );
});
