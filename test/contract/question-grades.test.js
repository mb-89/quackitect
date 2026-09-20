// The two rules grading a question, read off the notes that ship.
// [[spec/design_output/pull#a-person-step-goes-in]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { actionables } from "../../.claude/skills/level0/lib/guidance.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const rulesIn = (path) => actionables(files.read(join(root, ...path.split("/"))));

// [[spec/tickets/a-question-reaches-its-owner]]
test("the working note asks the owner a design question before the build", () => {
  const rules = rulesIn("spec/guidance/working.md");
  const said = rules.filter((one) => /design question/i.test(one));

  assert.equal(said.length, 1, "one rule names the design question");
  assert.match(
    said[0],
    /spec\/design_input/,
    "the rule names the notes it reads first",
  );
  assert.match(said[0], /before you build/i, "the rule puts the ask before the build");
  assert.match(
    said[0],
    /Name the assumption you take where the owner says to carry on/,
    "the rule keeps the sentence standing there",
  );
});

// [[spec/tickets/a-question-reaches-its-owner]]
test("the reviewing note grades each question, and hands a craft one back", () => {
  const rules = rulesIn("spec/guidance/review/reviewing.md");
  const said = rules.filter((one) => /craft/i.test(one));

  assert.equal(said.length, 1, "one rule grades the question");
  assert.match(said[0], /design or craft/i, "the rule names both grades");
  assert.match(said[0], /back to the drafter/i, "the rule says where a craft one goes");
});
