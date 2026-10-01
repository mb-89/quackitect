// The read of what a start writes to the serve log: the part past what the
// log held, and the line naming the fault in it.
// [[spec/design_output/level0#a-restart-watches-its-child]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { reasonIn, SERVE, wroteSince } from "../../.claude/skills/level0/lib/log.js";

// [[spec/design_output/level0#a-restart-watches-its-child]]
test("the part a start writes leaves out what the log held before it", () => {
  assert.equal(
    wroteSince("an older line\n", "an older line\nError: new\n"),
    "Error: new",
  );
});

// [[spec/design_output/level0#a-restart-watches-its-child]]
test("a log the start cuts reads whole", () => {
  assert.equal(wroteSince("an older line\n", "Error: new\n"), "Error: new");
});

// [[spec/design_output/level0#a-restart-watches-its-child]]
test("the reason is the first line naming an error, else the last line", () => {
  assert.equal(reasonIn("up\nError: one\nError: two\n"), "Error: one");
  assert.equal(reasonIn("up\nNode.js v22\n"), "Node.js v22");
});

// [[spec/design_output/level0#a-restart-watches-its-child]]
test("a start that writes nothing names the log it reads", () => {
  assert.equal(reasonIn(""), `it wrote nothing to ${SERVE}`);
});
