// The size ceiling, counted over texts alone. The caller hands the ceilings
// in, so every case here names its own.
// [[spec/design_output/level0#the-size-ceiling]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FILE_RULE,
  FUNCTION_RULE,
  functionsIn,
  grows,
  sizeFaults,
} from "../../.claude/skills/level0/lib/size.js";

const SMALL = { function: 3, file: 12 };

const code = [
  "// a header",
  "export function short() {",
  "  return 1;",
  "}",
  "",
  "function long(a) {",
  '  const s = "}";',
  "  if (a) {",
  "    return s;",
  "  }",
  "  return a;",
  "}",
  "",
  "const arrow = (x) => {",
  "  return x;",
  "};",
].join("\n");

test("every function answers its name, its line and its length, and a brace in a string counts none", () => {
  const found = functionsIn(code.split("\n"));
  assert.deepEqual(
    found.map((one) => [one.name, one.line, one.lines]),
    [
      ["short", 2, 3],
      ["long", 6, 7],
      ["arrow", 14, 3],
    ],
  );
});

test("a function past its ceiling meets a finding naming it, and one under it none", () => {
  const found = sizeFaults(code, "src/a.js", SMALL);
  assert.deepEqual(
    found.map((one) => [one.rule, one.said, one.count, one.line]),
    [
      [FILE_RULE, "the file", 16, 1],
      [FUNCTION_RULE, "long", 7, 6],
    ],
  );
  assert.match(found[1].message, /A function holds 3 lines, and long holds 7/);
  assert.equal(sizeFaults(code, "src/a.js", { function: 10, file: 100 }).length, 0);
});

test("a file past its ceiling meets a finding, and a file of another kind meets none", () => {
  const found = sizeFaults(code, "src/a.js", { file: 10 });
  assert.deepEqual(
    found.map((one) => one.rule),
    [FILE_RULE],
  );
  assert.match(found[0].message, /A file holds 10 lines, and the file holds 16/);
  assert.equal(sizeFaults(code, "spec/a.md", SMALL).length, 0, "a note is no code");
  assert.equal(sizeFaults(code, "src/a.js", {}).length, 0, "no ceiling, no finding");
});

test("a go function counts the same way", () => {
  const go = ["package a", "", "func (t *T) Run(x int) int {", "\treturn x", "}"].join(
    "\n",
  );
  assert.deepEqual(
    functionsIn(go.split("\n")).map((one) => [one.name, one.lines]),
    [["Run", 3]],
  );
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a write grows past a ceiling and meets the finding, and a cut to a file already past it passes", () => {
  const before = code;
  const after = `${code}\n// one more line\n`;
  const grown = grows(before, after, "src/a.js", { function: 100, file: 16 });
  assert.deepEqual(
    grown.map((one) => one.rule),
    [FILE_RULE],
    "one more line past the ceiling",
  );

  const cut = grows(after, before, "src/a.js", { function: 100, file: 12 });
  assert.equal(cut.length, 0, "a shorter file past the ceiling still passes");

  const fresh = grows("", code, "src/a.js", SMALL);
  assert.deepEqual(
    fresh.map((one) => one.rule).sort(),
    [FILE_RULE, FUNCTION_RULE],
    "a new file meets every ceiling",
  );

  const longer = code.replace("  return a;\n}", "  return a;\n  // more\n}");
  const function_ = grows(code, longer, "src/a.js", { function: 3, file: 100 });
  assert.deepEqual(
    function_.map((one) => one.said),
    ["long"],
    "the function that grows is the one named",
  );
});
