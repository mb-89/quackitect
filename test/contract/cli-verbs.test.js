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
