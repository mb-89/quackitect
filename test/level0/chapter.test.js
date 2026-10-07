// A ticket's chapter for one leaf, read off its headings.
// [[spec/design_output/pull#the-fields-hold-their-forms]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { chapterOf } from "../../src/scripts/chapter.js";

const TICKET = [
  "---",
  "kind: [[ticket]]",
  "---",
  "",
  "# Ask",
  "",
  "A thing.",
  "",
  "# do",
  "",
  "The leaf's own line.",
  "",
  "## tests",
  "",
  "<!-- the tests that cover the change -->",
  "",
  "    ./RUNME.sh check",
  "",
  "## says",
  "",
  "```",
  "a fenced line",
  "```",
  "",
].join("\n");

test("a chapter answers its own lines and each field's lines, and a comment or a fenced block counts none", () => {
  const said = chapterOf(TICKET, "do");
  assert.equal(said.stands, true);
  assert.deepEqual(said.own, ["The leaf's own line."]);
  assert.deepEqual(said.fields.get("tests"), ["./RUNME.sh check"]);
  assert.deepEqual(said.fields.get("says"), []);
});

test("a leaf with no heading answers no chapter", () => {
  assert.deepEqual(chapterOf(TICKET, "review"), { stands: false, own: [], fields: new Map() });
});
