// Which files the editor draws. The index draws a ticket's graph, and
// test/level0/lens-v1.test.js holds the drawing over a fake index.
// [[spec/tickets/the-lens-reads-v1]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { drawable } from "../../src/extension/lib/drawing.js";

test("a process file and a ticket draw, and nothing else does", () => {
  assert.equal(drawable("spec/processes/standard.yaml"), "process");
  assert.equal(drawable("spec/tickets/a-ticket.md"), "ticket");
  assert.equal(drawable(".se/tickets/slow-lint.md"), "ticket");
  assert.equal(drawable("spec/guidance/working.md"), "");
  assert.equal(drawable("spec/processes/README.md"), "");
  assert.equal(drawable(""), "");
});

test("a windows path reads the same as a path with slashes", () => {
  assert.equal(drawable("spec\\processes\\standard.yaml"), "process");
});
