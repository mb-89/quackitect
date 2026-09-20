// The rules the shipped voice note hands the judge. A contract case, because
// it reads the note standing on the disk.
// [[spec/design_output/pull#the-checks]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { actionables, forEvidence } from "../../.claude/skills/level0/lib/guidance.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const NOTE = "spec/guidance/voice";
const text = disk().read(join(root, "spec", "guidance", "voice.md"));

// [[spec/tickets/the-judge-reads-answer-rules]]
test("the shipped voice note keeps its answer rules out of the judge's material", () => {
  const said = actionables(text);
  const rules = forEvidence(text, NOTE);

  assert.ok(rules.length, "the note hands the judge rules");
  assert.ok(rules.length < said.length, "the marked rules stand out of the material");
  assert.equal(rules[0].label, "voice-1");
  for (const one of rules) {
    assert.equal(
      said[one.number - 1],
      one.rule,
      "the label's number reads the line the chapter holds",
    );
    assert.doesNotMatch(one.rule, /^Open an answer with a table/);
    assert.doesNotMatch(one.rule, /^Close an answer ending on a stop call/);
  }
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("the output style reads every rule whole, and shows no mark", () => {
  for (const one of actionables(text)) {
    assert.doesNotMatch(one, /[*^]$/, "the chapter reader strips both marks");
    assert.doesNotMatch(one, /`\^`$/, "a mark in a code span strips the same way");
  }
});
