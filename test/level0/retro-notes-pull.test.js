// A group standing at a retro step hands its private notes out before itself,
// so the hand drains them and the group's notes step passes.
// [[spec/tickets/a-retro-hand-decides-notes]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { frontOf } from "../../src/engine/group.js";
import { atRetro } from "../../src/scripts/pull-hand.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, GROUP_NOTE, heard, ROOT, standing } from "./pull-doors.js";

// A note a hand parks mid-work, which the retro decides.
const NOTE = `---
kind: [[ticket]]
state: open
steps:
  - name: decide
    does: says what the note becomes, and closes it
    by: retro
    input: ask
    evidence:
      - name: outcome
        form: choice
        options: ["dropped", "done", "became"]
        says: what the note becomes
step: decide
---

# Ask

A thing to look at later.

# decide

## outcome

# Discussion
`;

const groupAt = (step) =>
  GROUP_NOTE.replace("state: open\n", `state: open\nstep: ${step}\n`);

const pulled = (step) => {
  const files = standing(CHILD("closed", "do"), groupAt(step), {
    [at(".se/tickets/a-note.md")]: NOTE,
  });
  return heard(() => pulling(ROOT, ["pull"], doors(files).it)).said;
};

// [[spec/tickets/a-retro-hand-decides-notes]]
test("a group at its notes step hands the private note out first", () => {
  assert.match(pulled("retro/notes"), /a-note at decide/);
});

// [[spec/tickets/a-retro-hand-decides-notes]]
test("a group short of its retro hands itself out before the note", () => {
  assert.match(pulled("split"), /one-group at split/);
});

// [[spec/tickets/a-retro-hand-decides-notes]]
test("atRetro reads a group at a retro step, and one short of it", () => {
  const group = (step) => {
    const text = groupAt(step);
    return [{ name: "one-group", private: false, text, front: frontOf(text) }];
  };
  assert.equal(atRetro(group("retro/notes"), "one-group"), true);
  assert.equal(atRetro(group("split"), "one-group"), false);
});
