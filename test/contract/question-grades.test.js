// The rules grading a question, read off the notes that ship.
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

// A design review fails an unusable approach alone, a finding rides out as a child, and form fails nothing. [[spec/tickets/one-review-a-ticket]]
test("the design review note fails an unusable approach alone, sends each other finding to a child, and fails nothing on form", () => {
  const path = "spec/guidance/review/design.md";
  assert.ok(files.exists(join(root, ...path.split("/"))), `${path} stands`);
  const rules = rulesIn(path);

  const fails = rules.filter((one) => /\bfail/i.test(one) && /unusable/i.test(one));
  assert.equal(fails.length, 1, "one rule fails a design, on an unusable approach");
  const findings = rules.filter((one) => /pass with findings/i.test(one));
  assert.equal(findings.length, 1, "one rule sends the other findings under pass with findings");
  assert.match(findings[0], /child/i, "the rule mints a child");
  assert.match(findings[0], /\brow\b/i, "one child a row");
  const form = rules.filter((one) => /\bform\b/i.test(one));
  assert.equal(form.length, 1, "one rule grades a form finding");
  assert.doesNotMatch(form[0], /\bfails? (the|a) (design|review)\b/i, "a form finding fails no review");
  assert.match(form[0], /\bpass/i, "the review passes over it");
});

// [[spec/tickets/a-question-reaches-its-owner]]
test("the reviewing note fails a design on design alone, and hands craft to the implement step", () => {
  const rules = rulesIn("spec/guidance/review/reviewing.md");
  const said = rules.filter((one) => /craft/i.test(one));

  assert.equal(said.length, 1, "one rule grades the question");
  assert.match(said[0], /on a design finding alone/i, "the rule fails a design on design alone");
  assert.match(said[0], /craft finding to the implement step/i, "the rule says where a craft one goes");
});
