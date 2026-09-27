// The command line's own table, read as text because the module exits at
// import: every verb says what it does, and the vehicle verb says vehicle.
// [[spec/design_output/editor#one-command-opens-the-editor]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli.js"));

// The table's rows, each a verb naming what it says, on one line or over two. [[spec/design_output/editor#one-command-opens-the-editor]]
const saysOf = (verb) => {
  const found = new RegExp(`^  ${verb}: \\{\\s*says: "([^"]*)"`, "m").exec(source);
  return found ? found[1] : "";
};

test("the vehicle verb says vehicle, and copy stands nowhere in its line", () => {
  const said = saysOf("vehicle");
  assert.match(said, /vehicle/);
  assert.doesNotMatch(said, /\bcopy\b/);
});

test("every verb in the table says what it does", () => {
  for (const verb of [
    "check",
    "lint",
    "branch",
    "ticket",
    "retro",
    "vehicle",
    "stub",
    "tui",
    "push",
  ]) {
    assert.ok(saysOf(verb).length > 0, `${verb} says something`);
  }
});

// The index walks no log, so the find verb hands a log search to the log verb and every other search to the index. [[spec/design_output/log#one-verb-reads-the-log]]
test("the find verb reads the log through the log verb, and the tree through the index", () => {
  const row = /^ {2}find: \{[\s\S]*?^ {2}\},/m.exec(source)?.[0] ?? "";
  assert.match(saysOf("find"), /--log/);
  assert.match(row, /rest\.includes\("--log"\)/);
  assert.match(row, /logVerb\(tuiDoors\(\), \[\s*"--words"/);
  assert.match(row, /asksIndex\(\["find", \.\.\.rest\]\)/);
});

// The verb over named files hands them to the branch runner, and test/level0/test-verb.test.js proves that runner's word over a fake. [[spec/design_output/pull#the-test-verb]]
test("the test verb hands the files you name to the branch runner", () => {
  const row = /^ {2}test: \{[\s\S]*?^ {2}\},/m.exec(source)?.[0] ?? "";
  assert.match(
    row,
    /rest\.length \? namedTests\(rest\)/,
    "the row hands what you name through",
  );
  const named =
    /^export function namedTests\(names\) \{[\s\S]*?^\}/m.exec(source)?.[0] ?? "";
  assert.match(named, /testVerb\(/, "and the named files reach the branch runner");
  assert.match(named, /\["test", \.\.\.names\]/, "every one of them");
});

// Under --errors the parts run quiet, and the check prints the red cases and the findings at error alone. [[spec/tickets/the-verbs-need-no-wrapper]]
test("the check verb under --errors runs its parts quiet, and prints what errorsSaid answers", () => {
  const row = /^ {2}check: \{[\s\S]*?^ {2}\},/m.exec(source)?.[0] ?? "";
  assert.match(row, /rest\.includes\("--errors"\)/, "the row reads the flag");
  assert.match(row, /test\(errors\)/, "the tests run quiet");
  assert.match(row, /goHolds\(errors\)/, "and the Go tests");
  assert.match(
    row,
    /errorsSaid\(timesHere\(\), errorsStood\(\)\)/,
    "then the red rows print",
  );
  const run =
    /^export function test\(quiet = false\) \{[\s\S]*?^\}/m.exec(source)?.[0] ?? "";
  assert.match(run, /inherit: !quiet/, "a quiet run keeps its output");
});

// A desk's verb pushes nothing, so the commit verb says where it pushes. [[spec/guidance/working]]
test("the commit verb says it pushes from a cloud box", () => {
  assert.match(saysOf("commit"), /from a cloud box/);
});
