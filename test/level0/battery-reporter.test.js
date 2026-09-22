// The runner's reporter for the battery, read off fixture events: a pass, a
// fail with its cause, and an event that is no case at all.
// [[spec/design_output/work#the-battery-answers-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { rowOf } from "../../src/scripts/battery-reporter.js";

const FROM = "/tree";
const FILE = "/tree/test/contract/stub.test.js";

test("a pass reads as a row with its file relative to the root, its name and its time", () => {
  const said = rowOf(
    {
      type: "test:pass",
      data: {
        name: "a stub holds its files",
        nesting: 0,
        file: FILE,
        details: { duration_ms: 13.8 },
      },
    },
    FROM,
  );
  assert.deepEqual(said, {
    file: "test/contract/stub.test.js",
    name: "a stub holds its files",
    nesting: 0,
    ms: 13.8,
    ok: true,
  });
});

test("a fail carries the error's first line, and the cause's where one stands", () => {
  const error = new Error("the case failed\n\n1 !== 2\n");
  error.cause = new Error("the vehicle answers\nmore");
  const said = rowOf(
    {
      type: "test:fail",
      data: {
        name: "the shim hands a verb",
        nesting: 1,
        file: FILE,
        details: { duration_ms: 2, error },
      },
    },
    FROM,
  );
  assert.equal(said.ok, false);
  assert.equal(said.nesting, 1);
  assert.equal(said.said, "the vehicle answers");

  const bare = rowOf(
    {
      type: "test:fail",
      data: {
        name: "bare",
        file: FILE,
        details: { duration_ms: 1, error: new Error("one is two") },
      },
    },
    FROM,
  );
  assert.equal(bare.said, "one is two");
});

test("an event that is no case answers nothing", () => {
  assert.equal(rowOf({ type: "test:diagnostic", data: {} }, FROM), null);
  assert.equal(rowOf({ type: "test:start", data: { name: "a" } }, FROM), null);
});
