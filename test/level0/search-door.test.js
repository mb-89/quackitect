// The find tool over the warm index, and the door reading a search the index
// answers.
// [[spec/design_output/index#the-door-answers-the-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { answersFromIndex, FIND, findSpec } from "../../src/bridge/search.js";

const boxOf = (answer) => ({
  index: { ask: () => answer, warm: () => {} },
  log: { say: () => {} },
});

test("the spec names the find tool and the words it takes", () => {
  const said = findSpec();

  assert.equal(said.name, FIND);
  assert.deepEqual(said.inputSchema.required, ["words"]);
  assert.match(said.description, /index/);
});

test("a call naming no search passes through", () => {
  assert.deepEqual(answersFromIndex({}, boxOf(null)), { pass: true });
});

test("an absolute path passes through, because the index reads the tree", () => {
  const e = { tool: "Grep", path: "/elsewhere", method: "grep", params: {} };

  assert.deepEqual(answersFromIndex(e, boxOf({ rows: [] })), { pass: true });
});
