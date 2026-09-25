// The warnings a push carries. Every case hands the filter rows and reads the
// rows it answers, so the lint runs nowhere and no disk is touched.
// [[spec/tickets/one-list-holds-the-warnings]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filesOn,
  formIn,
  refusedWarnings,
  refusesIn,
  rowOf,
  WARNING,
  warnedNote,
  warningsOn,
} from "../../.claude/skills/level0/lib/warnings.js";
import { holds, refsIn } from "../../src/scripts/prepush.js";

const SHA = "a1b2c3d4e5f6a7b8";
const ZEROS = "0000000000000000";
const toWork = `refs/heads/work/x ${SHA} refs/heads/work/x ${ZEROS}\n`;

const found = (file, severity, rule = "Hedge") => ({
  file,
  rule,
  line: 3,
  column: 1,
  message: "Cut the hedge.",
  severity,
});

test("the word this tree reads for a side that lets a write land", () => {
  assert.equal(WARNING, "warning");
});

// [[spec/tickets/one-list-holds-the-warnings]]
test("the filter keeps a warning on a file the push carries, and drops the rest", () => {
  const rows = [
    found("a.md", "warning"),
    found("b.md", "warning"),
    found("a.md", "error"),
  ];

  assert.deepEqual(warningsOn(rows, ["a.md"]), [found("a.md", "warning")]);
  assert.deepEqual(warningsOn(rows, []), []);
  assert.deepEqual(warningsOn([], ["a.md"]), []);
});

// [[spec/tickets/one-list-holds-the-warnings]]
test("the files read once each, in order, whatever the rows say", () => {
  const rows = [
    found("b.md", "warning"),
    found("a.md", "warning"),
    found("b.md", "warning"),
  ];
  assert.deepEqual(filesOn(rows), ["a.md", "b.md"]);
});

// [[spec/tickets/one-list-holds-the-warnings]]
test("the refusal names each file, each rule and the command that reads them", () => {
  const said = refusedWarnings([
    found("a.md", "warning"),
    found("b.md", "warning", "Shape"),
  ]);

  assert.match(said, /a\.md/);
  assert.match(said, /b\.md/);
  assert.match(said, /Hedge, Shape/);
  assert.match(said, /RUNME\.sh lint/);
});

// A warning holds no push at this door, so the door reads no lint. [[spec/design_output/config#the-engine-controls]]
test("a push carrying a file at warning lands, and the door reads no lint", () => {
  const carried = () => [{ name: "a.md", text: "" }];
  const warned = () => [found("a.md", "warning")];

  assert.deepEqual(holds(refsIn(toWork), "", carried, warned), { code: 0, said: "" });
  assert.deepEqual(holds(refsIn(toWork), "", carried), { code: 0, said: "" });
});

// A warning outside the files a push carries holds no push. [[spec/tickets/one-list-holds-the-warnings]]
test("a warning on a file the push leaves alone holds no push", () => {
  const carried = () => [{ name: "a.md", text: "" }];
  const elsewhere = () => [found("spec/tickets/old.md", "warning")];

  assert.deepEqual(holds(refsIn(toWork), "", carried, elsewhere), {
    code: 0,
    said: "",
  });
});

// [[spec/design_output/level0#the-panel-holds-a-warning]]
test("the note after a write names each row, and says the lines stand in the panel while the ask goes on", () => {
  const said = warnedNote("a.md", [found("a.md", "warning")]);
  assert.match(said, /1 line\(s\) of a\.md stand at warning, and the write lands/);
  assert.match(
    said,
    /stands in the Problems panel, and the push waits until the panel stands clear/,
  );
  assert.match(said, /Leave the lines as they stand and carry on with the ask/);
  assert.match(said, /a\.md:3 Hedge: Cut the hedge\./);
  assert.doesNotMatch(said, /refactoring hand/);
  assert.equal(rowOf(found("a.md", "warning")), "a.md:3 Hedge: Cut the hedge.");
});

// A break of form warns at every door, whatever its level, and a lint that ran nowhere or a private name still refuses. [[spec/design_output/level0#the-panel-holds-a-warning]]
test("a finding of form warns at any level, and the lint that ran nowhere and a private name refuse", () => {
  const erred = found("a.md", "error", "VoiceParagraph.Vocabulary");
  const warned = found("a.md", "warning", "VoiceParagraph.Sentence");
  const bare = { rule: "FunctionCeiling", line: 1 };
  const unran = found("a.md", "error", "VoiceRulesRan");
  const home = found("a.md", "error", "VoiceVale.Private");
  const stripped = found("a.md", "error", "Private");
  const all = [erred, warned, bare, unran, home, stripped];
  assert.deepEqual(refusesIn(all), [unran, home, stripped], "the name past the style decides");
  assert.deepEqual(formIn(all), [erred, warned, bare]);
  assert.deepEqual(refusesIn(undefined), []);
  assert.deepEqual(formIn(undefined), []);
});
