// The find tool over the warm index, and the door reading a search the index
// answers.
// [[spec/design_output/index#the-door-answers-the-tools]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { answersFromIndex, FIND, findSpec, runsFind } from "../../src/bridge/search.js";
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
  assert.deepEqual(Object.keys(said.inputSchema.properties), ["words", "function"]);
  assert.deepEqual(said.inputSchema.required, []);
  assert.match(said.description, /index/);
  assert.match(said.description, /body/);
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
  const door = doorAnswering(
    "error parsing regexp: invalid or unsupported Perl syntax\n",
  );
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
  const door = doorAnswering(
    "the index door does not answer, and one would not start\n",
  );
  assert.equal(door.ask("grep", { pattern: "a" }), null);
  assert.match(door.dead(), /answers 1/);
  assert.equal(door.fault(), "");
});

const SOURCE = [
  "// A head.",
  "export function walks(x) {",
  "  if (x) {",
  '    return "}";',
  "  }",
  "  return 0;",
  "}",
  "",
  "const other = walks(1);",
  "",
].join("\n");

function finding(rows) {
  const asked = [];
  const box = {
    work: "/tree",
    disk: fakeDisk({ "/tree/src/a.js": SOURCE, "/tree/src/b.go": GO }),
    index: {
      find: (words) => asked.push(words) && rows,
      warm: () => ({ warmed: false }),
      dead: () => "",
    },
    log: fakeLog(),
  };
  return { box, asked };
}

const GO = ["package b", "", "func (r *Row) walks() int {", "\treturn 1", "}", ""].join(
  "\n",
);

// The index finds the line, and the disk hands the body to its close. [[spec/design_output/index#find-reads-a-body]]
test("find answers a function by name with its body, read off the disk to its close", () => {
  const { box, asked } = finding([
    { path: "src/a.js", line: 9, text: "const other = walks(1);" },
    { path: "src/a.js", line: 2, text: "export function walks(x) {" },
  ]);

  const said = runsFind({ function: "walks" }, box).result.result;

  assert.deepEqual(asked, ["walks"], "the index looks for the name");
  assert.equal(
    said,
    [
      "src/a.js:2",
      "export function walks(x) {",
      "  if (x) {",
      '    return "}";',
      "  }",
      "  return 0;",
      "}",
    ].join("\n"),
  );
});

// [[spec/design_output/index#find-reads-a-body]]
test("find reads a Go method's body the way it reads a function's", () => {
  const { box } = finding([
    { path: "src/b.go", line: 3, text: "func (r *Row) walks() int {" },
  ]);

  assert.equal(
    runsFind({ function: "walks" }, box).result.result,
    ["src/b.go:3", "func (r *Row) walks() int {", "\treturn 1", "}"].join("\n"),
  );
});

// [[spec/design_output/index#find-reads-a-body]]
test("a name no definition carries answers that nothing defines it", () => {
  const { box } = finding([
    { path: "src/a.js", line: 9, text: "const other = walks(1);" },
  ]);

  assert.equal(
    runsFind({ function: "walks" }, box).result.result,
    "Nothing in the index defines walks.",
  );
});
