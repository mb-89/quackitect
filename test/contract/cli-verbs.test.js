// The command line's own table, read as text because the module exits at
// import: every verb says what it does, and the vehicle verb says vehicle.
// [[spec/design_output/level0#what-level-zero-is]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli.js"));

// The table's rows, each a verb naming what it says, on one line or over two. [[spec/design_output/level0#what-level-zero-is]]
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
