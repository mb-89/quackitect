// The values a shell command gives its names, read off the words of each
// segment, and a word read through them.
// [[spec/design_output/bash#a-target-behind-a-variable]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assigned,
  holdsAName,
  resolved,
} from "../../.claude/skills/level0/lib/shell-values.js";

test("a segment of assignments alone sets each value, bare or behind export, through the values before it", () => {
  const values = new Map();
  assigned(["out=spec"], values);
  assigned(["export", "f=$out/one.md"], values);
  assigned(["g=two.md", "echo", "x"], values);
  assert.deepEqual([...values], [
    ["out", "spec"],
    ["f", "spec/one.md"],
  ]);
});

test("a word reads through the values, braced or bare, and keeps a name with no value", () => {
  const values = new Map([["out", "/tmp"]]);
  assert.equal(resolved("$out/y.md", values), "/tmp/y.md");
  assert.equal(resolved(`$${"{out}"}/y.md`, values), "/tmp/y.md");
  assert.equal(resolved("$f", values), "$f");
  assert.equal(holdsAName("$f"), true);
  assert.equal(holdsAName("/tmp/y.md"), false);
});
