// The warnings a push carries. Every case hands the filter rows and reads the
// rows it answers, so the lint runs nowhere and no disk is touched.
// [[spec/tickets/one-list-holds-the-warnings]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filesOn,
  refusedWarnings,
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
  const rows = [found("b.md", "warning"), found("a.md", "warning"), found("b.md", "warning")];
  assert.deepEqual(filesOn(rows), ["a.md", "b.md"]);
});

// [[spec/tickets/one-list-holds-the-warnings]]
test("the refusal names each file, each rule and the command that reads them", () => {
  const said = refusedWarnings([found("a.md", "warning"), found("b.md", "warning", "Shape")]);

  assert.match(said, /a\.md/);
  assert.match(said, /b\.md/);
  assert.match(said, /Hedge, Shape/);
  assert.match(said, /RUNME\.sh lint/);
});

// [[spec/tickets/one-list-holds-the-warnings]]
test("a push carrying a file at warning is refused, and one carrying none passes", () => {
  const carried = () => [{ name: "a.md", text: "" }];
  const warned = () => [found("a.md", "warning")];
  const clean = () => [found("a.md", "error")];

  assert.equal(holds(refsIn(toWork), "", carried, warned).code, 1);
  assert.match(holds(refsIn(toWork), "", carried, warned).said, /a\.md/);
  assert.deepEqual(holds(refsIn(toWork), "", carried, clean), { code: 0, said: "" });
  assert.deepEqual(holds(refsIn(toWork), "", carried), { code: 0, said: "" });
});

// A warning outside the files a push carries holds no push. [[spec/tickets/one-list-holds-the-warnings]]
test("a warning on a file the push leaves alone holds no push", () => {
  const carried = () => [{ name: "a.md", text: "" }];
  const elsewhere = () => [found("spec/tickets/old.md", "warning")];

  assert.deepEqual(holds(refsIn(toWork), "", carried, elsewhere), { code: 0, said: "" });
});
