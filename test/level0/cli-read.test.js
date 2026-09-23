// The lint's reading of a tree: the warnings stand as a list the stamp
// carries, and the list stands empty before any lint runs.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { lintRows, version, warningsStood } from "../../src/scripts/cli-read.js";

// A warning lands under every door, and the refactoring hand drains the list the stamp carries. [[spec/design_output/config#the-engine-controls]]
test("the warnings stand as a list, empty before any lint, and the version reads as text", () => {
  assert.deepEqual(
    warningsStood(),
    [],
    "the warnings stand as an empty list before any lint",
  );
  assert.equal(typeof version(), "string");
  assert.notEqual(version(), "", "the version names something, or the fallback");
});

// The count reads first, so the finding lines stand last where a reader's eye lands. [[spec/design_output/lsp#one-checker-every-front-asks]]
test("the lint prints the count per rule first, and ends on the finding lines", () => {
  const found = [
    { rule: "Alpha", line: 1 },
    { rule: "Beta", line: 2 },
    { rule: "Alpha", line: 3 },
  ];
  const lineOf = (one) => `x.md:${one.line} ${one.rule}`;
  assert.deepEqual(lintRows(found, lineOf), [
    "     2  Alpha",
    "     1  Beta",
    "     3  in all",
    "",
    "x.md:1 Alpha",
    "x.md:2 Beta",
    "x.md:3 Alpha",
  ]);
  assert.deepEqual(lintRows(found.slice(0, 1), lineOf, ["", "a note"]), [
    "     1  Alpha",
    "     1  in all",
    "",
    "a note",
    "",
    "x.md:1 Alpha",
  ]);
});
