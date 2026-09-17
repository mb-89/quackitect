// The magic numbers in Go, counted over texts alone.
// [[spec/design_output/config#the-magic-numbers-take-names]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { codeFaults, magicIn, RULE } from "../../.claude/skills/level0/lib/magic.js";
import { FILE_RULE } from "../../.claude/skills/level0/lib/size.js";

const go = [
  "package a",
  "",
  "const (",
  "\tnamed = 30 * time.Second",
  ")",
  "",
  "const single = 45",
  "",
  "func wait(x []int) {",
  "\ttime.Sleep(100 * time.Millisecond) // 250 stands here in a comment",
  '\tfmt.Println("7 apples", x[3], x[0], x[1], x[2], `tag:"5"`)',
  "\tif len(x) > 0o755 {",
  "\t\treturn",
  "\t}",
  "}",
].join("\n");

test("a bare number in a Go body is refused, and a constant, a string, an index and a comment pass", () => {
  const found = magicIn(go, "src/lsp/a.go");
  assert.deepEqual(
    found.map((one) => [one.rule, one.line, one.said, one.severity]),
    [[RULE, 10, "100", "warning"]],
  );
  assert.match(found[0].message, /100 carries a meaning here/);
});

test("a test file and a file of another kind meet no finding", () => {
  assert.equal(magicIn(go, "src/lsp/a_test.go").length, 0);
  assert.equal(magicIn(go, "src/a.js").length, 0);
});

test("the code faults carry the ceiling as a warning beside the numbers", () => {
  const found = codeFaults(go, "src/lsp/a.go", { file: 3 });
  assert.deepEqual(
    found.map((one) => [one.rule, one.severity]),
    [
      [FILE_RULE, "warning"],
      [RULE, "warning"],
    ],
  );
});
