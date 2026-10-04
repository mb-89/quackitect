// The verb table Go holds, and the programs read as text: every verb says what
// it does, the vehicle verb says vehicle, and each program hands its words on.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { commands, scriptText } from "./commands.js";

const saysOf = (verb) => commands().get(verb) ?? "";

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
  const program = scriptText("verbs/find.js");
  assert.match(saysOf("find"), /--log/);
  assert.match(program, /words\.includes\("--log"\)/);
  assert.match(program, /logVerb\(tuiDoors\(\), \[\s*"--words"/);
  assert.match(program, /asksIndex\(\["find", \.\.\.words\]\)/);
});

test("the command line's ticket entry names the yours, fill and route verbs", () => {
  for (const verb of ["yours", "fill", "route"]) {
    assert.match(saysOf("ticket"), new RegExp(`\\b${verb}\\b`));
  }
});

// A desk's verb pushes nothing, so the commit verb says where it pushes. [[spec/guidance/working]]
test("the commit verb says it pushes from a cloud box", () => {
  assert.match(saysOf("commit"), /from a cloud box/);
});
