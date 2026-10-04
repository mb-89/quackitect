// The setup and the doctor run in Go, so the JavaScript they reached leaves.
// Each case reads a module's source and finds no program entry, or no export
// nothing past its own tests imports.
// [[spec/tickets/box-verbs-dead-entries]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { disk } from "../../src/doors/disk.js";

const ROOT = join(import.meta.dirname, "..", "..");
const EDITOR = "src/scripts/editor.js";
const BROWSER = "src/scripts/browser.js";

const DEAD = {
  [EDITOR]: [
    "LIST",
    "KEPT",
    "readEntries",
    "entryFor",
    "upsert",
    "register",
    "linkedAt",
    "linkAt",
    "registered",
    "rootHere",
    "manifestPath",
  ],
  [BROWSER]: ["browserSays"],
};

function source(where) {
  return disk().read(join(ROOT, where));
}

function exported(text, name) {
  return new RegExp(`export\\s+(async\\s+)?(function|const|let)\\s+${name}\\b`).test(
    text,
  );
}

// [[spec/tickets/box-verbs-dead-entries]]
test("editor.js carries no program entry", () => {
  assert.ok(
    !source(EDITOR).includes("process.argv"),
    "editor.js still reads process.argv",
  );
});

test("browser.js carries no program entry", () => {
  assert.ok(
    !source(BROWSER).includes("process.argv"),
    "browser.js still reads process.argv",
  );
});

for (const [where, names] of Object.entries(DEAD)) {
  for (const name of names) {
    test(`${where} exports no ${name}, which nothing past its own tests imports`, () => {
      assert.ok(!exported(source(where), name), `${where} still exports ${name}`);
    });
  }
}
