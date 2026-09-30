// The lint reads the check module's sweep through quack, in place of a second
// server's list: the rows under the paths it asks, off a fake quack.
// [[spec/tickets/the-lsp-server-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { sweepRowsOf } from "../../src/scripts/quack-topic.js";

const ROWS = [
  {
    file: "spec/a.md",
    rule: "EveryPointerResolves",
    line: 3,
    column: 5,
    message: "a",
    severity: "error",
  },
  {
    file: "spec/deep/b.md",
    rule: "DeadAnchor",
    line: 1,
    column: 1,
    message: "b",
    severity: "warning",
  },
  {
    file: "src/c.go",
    rule: "MagicNumber",
    line: 9,
    column: 2,
    message: "c",
    severity: "warning",
  },
];

// Doors whose quack answers the sweep as the case seeds it, and records each call. [[spec/tickets/the-lsp-server-leaves]]
function doorsOf(answer, exitCode = 0) {
  const asked = [];
  return {
    asked,
    root: "/tree",
    join,
    disk: { exists: (path) => path === join("/tree", BIN) },
    proc: {
      run(argv) {
        asked.push(argv);
        return { exitCode, stdout: JSON.stringify(answer) };
      },
    },
  };
}

// [[spec/tickets/the-lsp-server-leaves]]
test("the lint reads the check sweep through quack", () => {
  const it = doorsOf(ROWS);
  const said = sweepRowsOf(it, ["."]);
  assert.deepEqual(it.asked, [[join("/tree", BIN), "sweep"]]);
  assert.deepEqual(said, ROWS);
});

// [[spec/tickets/the-lsp-server-leaves]]
test("the lint keeps the sweep's rows under the paths it asks", () => {
  const said = sweepRowsOf(doorsOf(ROWS), ["spec", "src/other.go"]);
  assert.deepEqual(
    said.map((one) => one.file),
    ["spec/a.md", "spec/deep/b.md"],
  );
});

// [[spec/tickets/the-lsp-server-leaves]]
test("a quack answering nothing answers null, so the lint names the fault", () => {
  assert.equal(sweepRowsOf(doorsOf(ROWS, 1), ["."]), null);
  assert.equal(sweepRowsOf(doorsOf({ rows: ROWS }), ["."]), null);
});
