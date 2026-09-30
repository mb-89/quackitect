// The start road's words: the codes it exits with, the line a caged session reads, and the tag a hand's helper carries. [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  cageText,
  INSTALL_SKIP,
  INSTALLED,
  NO_NODE,
  reasonOf,
  spawnTagOf,
} from "../../.claude/skills/level0/hooks/start.js";

test("each code the road exits with reads as a level and a reason, and an unnamed one warns", () => {
  assert.equal(reasonOf(NO_NODE)[0], "warn");
  assert.equal(reasonOf(INSTALLED)[0], "info");
  assert.equal(reasonOf(3)[0], "", "a desk starts its own server and says nothing");
  assert.match(reasonOf(42)[1], /42/);
});

test("the cage line names the code, its reason, and the command that installs", () => {
  const text = cageText(NO_NODE, "spawn node ENOENT");
  assert.match(text, /answers 5/);
  assert.match(text, /spawn node ENOENT/);
  assert.match(text, /\.\/RUNME\.sh serve/);
});

test("a hand's helper carries its session id, and a session with none carries nothing", () => {
  assert.match(spawnTagOf({ id: "s1" }), /session s1/);
  assert.equal(spawnTagOf(null), "");
  assert.match(INSTALL_SKIP, /\bindex\b/);
});
