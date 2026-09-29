// The tests a process lists as red: a ticket past tests-red and short of
// tests-green names them, and the check reads them apart.
// [[spec/design_output/pull#the-gate]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { testArgv } from "../../src/scripts/cli.js";
import { expectedRed, redListOf } from "../../src/scripts/red-list.js";

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

// The runner's file list reads the tree this case stands in. [[spec/design_output/pull#the-gate]]
test("the check's run names every test file but the red ones, and the globs where none stands red", () => {
  const at = resolve(".");
  const red = "test/level0/red-list.test.js";
  const argv = testArgv(at, [red]);
  assert.ok(!argv.includes(red), "the red file stays out");
  assert.ok(argv.includes("test/level0/pull-gate.test.js"), "every other file runs");
  assert.ok(!argv.some((one) => one.includes("*")), "and no glob reaches the red one");
  assert.ok(
    testArgv(at).some((one) => one.includes("*")),
    "no red list runs the globs",
  );
});

// [[spec/tickets/kept-red-reads-red-list]]
test("one leaf's red list reads each row as a bare path, and a leaf with no list reads empty", () => {
  const text =
    "---\nkind: [[ticket]]\n---\n\n# implement\n\n## tests-red\n\n### red\n\n- `test/level0/a.test.js`\n* test/level0/b.test.js\n\n## change\n";
  assert.deepEqual(redListOf(text, "implement/tests-red"), [
    "test/level0/a.test.js",
    "test/level0/b.test.js",
  ]);
  assert.deepEqual(redListOf(text, "implement/change"), []);
});

// [[spec/design_output/pull#kept-red-leaves]]
test("a red row joined by commas reads one path each", () => {
  const text =
    "---\nkind: [[ticket]]\n---\n\n# design\n\n## tests-red\n\n### red\n\nsrc/one/one_test.go,test/level0/a.test.js\n";
  assert.deepEqual(redListOf(text, "design/tests-red"), [
    "src/one/one_test.go",
    "test/level0/a.test.js",
  ]);
});
