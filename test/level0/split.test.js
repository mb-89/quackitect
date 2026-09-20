// The split verb's ranges and its cut, over text in memory.
// [[spec/design_output/level0#the-size-ceiling]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { cutsIn, splitText } from "../../src/scripts/split-cut.js";

const TEXT = ["one", "two", "three", "four", "five"].join("\n");

// [[spec/design_output/level0#the-size-ceiling]]
test("the flags read one target and its range, and again for each target", () => {
  const said = cutsIn([
    "--to",
    "src/a.js",
    "--lines",
    "1-2",
    "--to",
    "src/b.js",
    "--lines",
    "4-5",
  ]);

  assert.equal(said.why, "");
  assert.deepEqual(said.cuts, [
    { path: "src/a.js", from: 1, to: 2 },
    { path: "src/b.js", from: 4, to: 5 },
  ]);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a target with no range comes back refused, and a range with no target too", () => {
  assert.match(cutsIn(["--to", "src/a.js"]).why, /range/);
  assert.match(cutsIn(["--lines", "1-2"]).why, /target/);
  assert.match(cutsIn([]).why, /target/);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a range reading backwards, or past the file, comes back refused", () => {
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "4-2"]).why, /reads backwards/);
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "0-2"]).why, /first line is 1/);
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "two"]).why, /from-to/);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("the cut takes the named lines into each target, and the rest keeps the others", () => {
  const said = splitText(TEXT, [
    { path: "src/a.js", from: 1, to: 2 },
    { path: "src/b.js", from: 4, to: 5 },
  ]);

  assert.equal(said.why, "");
  assert.deepEqual(said.targets, [
    { path: "src/a.js", text: "one\ntwo\n" },
    { path: "src/b.js", text: "four\nfive\n" },
  ]);
  assert.equal(said.rest, "three\n");
});

// [[spec/design_output/level0#the-size-ceiling]]
test("two ranges reaching the same line come back refused", () => {
  const said = splitText(TEXT, [
    { path: "src/a.js", from: 1, to: 3 },
    { path: "src/b.js", from: 3, to: 5 },
  ]);

  assert.match(said.why, /line 3/);
  assert.deepEqual(said.targets, []);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a range past the last line comes back refused, and the text stands", () => {
  const said = splitText(TEXT, [{ path: "src/a.js", from: 4, to: 9 }]);

  assert.match(said.why, /holds 5 line/);
  assert.equal(said.rest, TEXT);
});
