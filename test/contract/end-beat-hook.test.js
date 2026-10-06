// The end beat fires when a session ends, and a clear inside a living session writes none.
// [[spec/tickets/clear-keeps-the-hold]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";

const SETTINGS = join(import.meta.dirname, "..", "..", ".claude", "settings.json");
const END_BEAT = "$CLAUDE_PROJECT_DIR/RUNME.sh branch beat --end";

test("the end beat matches every session end past a clear", () => {
  const ends = JSON.parse(disk().read(SETTINGS)).hooks.SessionEnd;
  const beating = ends.filter((one) => one.hooks.some((hook) => hook.command === END_BEAT));
  assert.equal(beating.length, 1, "one SessionEnd entry runs the end beat");
  const matches = new RegExp(`^(?:${beating[0].matcher})$`);
  assert.equal(matches.test("clear"), false, "a clear writes no end beat");
  for (const reason of ["logout", "prompt_input_exit", "other"]) {
    assert.equal(matches.test(reason), true, `an end on ${reason} writes the end beat`);
  }
});
