// The lint's reading of a tree: the warnings stand as a list the stamp
// carries, and the list stands empty before any lint runs.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findingsDoors,
  lintRows,
  version,
  warningsStood,
} from "../../src/scripts/cli-read.js";

// The lint's prose reader asks its slice's mode off the doors it runs on. [[spec/tickets/read-topics-switch-over]]
test("the check's own reading carries the slices the prose reader asks", async () => {
  const doors = await findingsDoors();
  assert.equal(typeof doors.slices?.prose, "string");
});

// The command line's lint keeps Vale's rows a file, and the other fronts read Vale fresh. [[spec/tickets/the-check-runs-fast-again]]
test("the check's own reading keeps Vale's rows a file", async () => {
  const doors = await findingsDoors();
  assert.equal(doors.valeCache, true);
});

// A warning lands under every door, and the stamp carries the list. [[spec/design_output/config#the-engine-controls]]
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
