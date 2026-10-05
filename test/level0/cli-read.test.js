// The lint's reading of a tree: the findings it leaves for the check, the
// version, and the rows it prints.
// [[spec/design_output/config#the-engine-controls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as read from "../../src/scripts/cli-read.js";
import {
  findingsDoors,
  lintFoundOf,
  lintRows,
  version,
} from "../../src/scripts/cli-read.js";

// readThrough in src/bridge/findings.js is the one road past Vale, so the command line exports no reader of its own. [[spec/tickets/go-prose-checks-stand-alone]]
test("the command line exports no prose reader beside findings.js", () => {
  assert.equal(read.readThroughTheReader, undefined);
});

// The index, links, notes and find verbs run in Go, so the command line asks the index for none of them. [[spec/tickets/read-verbs-port-to-go]]
test("the command line exports no ask of the index", () => {
  assert.equal(read.asksIndex, undefined);
});

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
test("the lint leaves each warning as its file and source, and each finding at error as its line", () => {
  const found = [
    { rule: "Alpha", line: 1, severity: "warning", file: "a.md", source: "vale" },
    { rule: "Beta", line: 2, severity: "error", file: "b.md", source: "tree" },
    { rule: "Gamma", line: 3, severity: "warning" },
  ];
  const lineOf = (one) => `${one.file}:${one.line} ${one.rule}`;
  assert.deepEqual(lintFoundOf(found, lineOf), {
    stood: [
      { file: "a.md", source: "vale" },
      { file: "", source: "" },
    ],
    erred: ["b.md:2 Beta"],
  });
  assert.deepEqual(lintFoundOf([], lineOf), { stood: [], erred: [] });
});

test("the version reads as text", () => {
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
