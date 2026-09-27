// What `check --errors` prints: the red cases the reporter wrote, then the
// findings at error, and nothing green or at warning between them.
// [[spec/tickets/the-verbs-need-no-wrapper]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as read from "../../src/scripts/cli-read.js";

const row = (said) => JSON.stringify(said);

// The reading exports the one function the check calls under --errors. [[spec/tickets/the-verbs-need-no-wrapper]]
function errorsSaid(lines, found) {
  assert.equal(typeof read.errorsSaid, "function", "the reading exports errorsSaid");
  return read.errorsSaid(lines, found);
}

test("check --errors names each red case and each finding at error, and no warning", () => {
  const lines = [
    row({ name: "a green case", file: "test/level0/one.test.js", ms: 3, ok: true }),
    row({
      name: "a red case",
      file: "test/level0/two.test.js",
      ms: 4,
      ok: false,
      said: "Expected values to be strictly equal",
    }),
  ].join("\n");
  const found = [
    {
      file: "spec/a.md",
      line: 3,
      column: 1,
      rule: "Refused",
      message: "A refusal.",
      severity: "error",
    },
    {
      file: "spec/b.md",
      line: 5,
      column: 2,
      rule: "Warned",
      message: "A warning.",
      severity: "warning",
    },
  ];

  const said = errorsSaid(lines, found);

  assert.deepEqual(said, [
    "test/level0/two.test.js: a red case: Expected values to be strictly equal",
    "spec/a.md:3:1: Refused: A refusal.",
  ]);
});

test("check --errors answers one line where nothing stands red", () => {
  assert.deepEqual(errorsSaid("", []), [
    "The check names no red case and no finding at error.",
  ]);
});
