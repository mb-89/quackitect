// The warnings a push carries. Every case hands the filter rows and reads the
// rows it answers, so the lint runs nowhere and no disk is touched.
// [[spec/tickets/one-list-holds-the-warnings]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  drains,
  filesOn,
  refusedWarnings,
  standsPast,
  takesFile,
  WARNING,
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

// A warning holds no push, because the refactoring hand drains it on the box, so the door reads no lint. [[spec/design_output/config#the-engine-controls]]
test("a push carrying a file at warning lands, and the door reads no lint", () => {
  const carried = () => [{ name: "a.md", text: "" }];
  const warned = () => [found("a.md", "warning")];

  assert.deepEqual(holds(refsIn(toWork), "", carried, warned), { code: 0, said: "" });
  assert.deepEqual(holds(refsIn(toWork), "", carried), { code: 0, said: "" });
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the list stands past the number where the count runs over it", () => {
  assert.equal(standsPast(26, 25), true);
  assert.equal(standsPast(25, 25), false);
  assert.equal(standsPast(99, 0), false);
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the hand takes the oldest file outside the window, and none inside it", () => {
  const now = 1_800_000_000;
  const week = 604_800;
  const wrote = { "a.md": now - week * 2, "b.md": now - week * 3, "c.md": now - 60 };

  assert.equal(takesFile(["a.md", "b.md", "c.md"], wrote, now, week), "b.md");
  assert.equal(takesFile(["c.md"], wrote, now, week), "");
  assert.equal(takesFile(["d.md"], wrote, now, week), "");
  assert.equal(takesFile([], wrote, now, week), "");
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the prompt the hand reads names one file and the verbs over it", () => {
  const said = drains("spec/guidance/voice.md");

  assert.match(said, /spec\/guidance\/voice\.md/);
  assert.match(said, /RUNME\.sh lint/);
  assert.match(said, /RUNME\.sh fix/);
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
