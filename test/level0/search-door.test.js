// The find tool over the warm index, and the door reading a search the index
// answers.
// [[spec/design_output/index#the-door-answers-the-tools]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { answersFromIndex, FIND, findSpec } from "../../src/bridge/search.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { index } from "../../src/doors/index.js";

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

const BIN_AT = join("/tree", BIN);

function doorAnswering(stderr) {
  const outside = fakeProc({ [BIN_AT]: { exitCode: 1, stderr } });
  return index(fakeDisk({ [BIN_AT]: "" }), outside, fakeClock(), "/tree");
}

// A pattern Go reads as no regexp exits 1, and the door stands. [[spec/design_output/index#a-dead-index-speaks]]
test("a question the index refuses alone reads the disk, and leaves the index standing", () => {
  const door = doorAnswering("error parsing regexp: invalid or unsupported Perl syntax\n");
  const warmed = [];
  const box = {
    index: { ...door, warm: () => warmed.push(1) && { warmed: false } },
    log: fakeLog(),
  };

  const said = answersFromIndex({ tool: "Grep", pattern: "(?<=a)b" }, box);
  assert.deepEqual(said, { pass: true }, "the real Grep reads the disk");
  assert.equal(door.dead(), "", "the index stands");
  assert.match(door.fault(), /error parsing regexp/);
  assert.deepEqual(warmed, [], "nothing warms an index that stands");
});

// [[spec/design_output/index#a-dead-index-speaks]]
test("a door that fails to answer reads as dead", () => {
  const door = doorAnswering("the index door does not answer, and one would not start\n");
  assert.equal(door.ask("grep", { pattern: "a" }), null);
  assert.match(door.dead(), /answers 1/);
  assert.equal(door.fault(), "");
});
