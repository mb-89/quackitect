// The write door reads the file as it stands after the edit, so a rule over
// the whole file reads the whole file, and an edit far from a header passes
// the way the header does.
// [[spec/design_output/level0#the-write-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { wholeAfter } from "../../src/bridge/write.js";

const PATH = "/tree/spec/vocabulary/terms.yml";
const WAS = [
  "# The terms: the words this tree writes past the core.",
  "",
  "terms:",
  '  - {word: shim, defines: "[[spec/funnel/a-button-makes-a-vehicle]]"}',
  '  - {word: stub, defines: "[[spec/funnel/a-button-makes-a-vehicle]]"}',
  "",
].join("\n");

test("an edit far from the header reads as the whole file with the edit in place", () => {
  const disk = fakeDisk({ [PATH]: WAS });
  const e = {
    tool: "Edit",
    file_path: PATH,
    old_string: '  - {word: stub, defines: "[[spec/funnel/a-button-makes-a-vehicle]]"}',
    new_string:
      '  - {word: stub, defines: "[[spec/funnel/a-button-makes-a-vehicle#the-stub]]"}',
  };
  const whole = wholeAfter(e, { path: PATH, text: e.new_string }, disk);
  assert.ok(whole.startsWith("# The terms"), "the header stands, far above the edit");
  assert.match(whole, /a-button-makes-a-vehicle#the-stub/);
  assert.equal(
    whole.split("\n").length,
    WAS.split("\n").length,
    "one line changed, none added",
  );
});

test("a multi-edit applies every edit in order, and a write is the text itself", () => {
  const disk = fakeDisk({ [PATH]: WAS });
  const e = {
    tool: "MultiEdit",
    file_path: PATH,
    edits: [
      { old_string: "word: shim", new_string: "word: shimmed" },
      { old_string: "word: stub", new_string: "word: stubbed" },
    ],
  };
  const whole = wholeAfter(e, { path: PATH, text: "" }, disk);
  assert.match(whole, /word: shimmed/);
  assert.match(whole, /word: stubbed/);
  assert.equal(
    wholeAfter({ tool: "Write", file_path: PATH }, { path: PATH, text: "fresh" }, disk),
    "fresh",
  );
});

test("an edit to a file nobody wrote yet reads as the new text alone", () => {
  const disk = fakeDisk({});
  const e = { tool: "Edit", file_path: PATH, old_string: "a", new_string: "b" };
  assert.equal(wholeAfter(e, { path: PATH, text: "b" }, disk), "b");
});
