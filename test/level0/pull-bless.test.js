// The bless at a gate, driven through the pull and the ticket verb over the fake
// doors in pull-doors.js: who blesses where, and what strips a bless.
// [[spec/design_output/pull#the-bless]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf } from "../../src/engine/group.js";
import { blessKept } from "../../src/scripts/pull-bless.js";
import { ticket } from "../../src/scripts/ticket.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  deskDoors,
  doors,
  filled,
  HOLD,
  heard,
  ROOT,
  SHA,
  standing,
} from "./pull-doors.js";

const TICKET = at("spec/tickets/a-child.md");
const BLESS_FILE = at(".se/.runtime/bless.json");
const BLESSED = /^\s+blessed: \S+$/m;

const TRIVIAL = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    by: anyone
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes
`;

// A ticket at a gate asking a bless, the design done before it. [[spec/design_output/pull#the-bless]]
const GATED = (record = "") => `---
kind: [[ticket]]
state: open
urgency: now
step: gate
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: tests-red
        does: writes the tests
        evidence:
          - name: red
            form: list
            says: the test files standing red
  - name: gate
    gate: the design answers the ask
    bless: true
    input: [design/draft, design/tests-red]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
  - name: implement
    steps:
      - name: change
        does: makes the change
        to: retro
        evidence:
          - name: says
            form: text
            says: what changes
group: one-group
${record}---

# Ask

One piece of it.

# design

## draft

### approach

The approach.

## tests-red

### red

- test/level0/one.test.js

# gate

## verdict

# implement

## change

### says

# Discussion
`;

// The gate after its accept, waiting for the bless. [[spec/design_output/pull#the-bless]]
const WAITING = filled(
  GATED(`record:
  - step: gate
    hand: box d462e994b4cef
    hash_before: ${SHA}
    hash_after: ${SHA}
`),
  "## verdict",
  "accept",
);

const EXTRA = { [at("spec/processes/trivial.yaml")]: TRIVIAL };

// The waiting gate over cloud doors, or desk doors where `desk` holds. [[spec/design_output/pull#the-bless]]
function waiting(more = {}, files = {}, desk = false) {
  const seed = standing(WAITING, undefined, { ...EXTRA, ...files });
  return desk
    ? deskDoors(seed, {}, { words: 5, ...more })
    : doors(seed, {}, { words: 5, ...more });
}

const blessing = (made) => heard(() => ticket(ROOT, ["bless", "a-child"], made.it));
const textOf = (made) => made.disk.read(TICKET);

// [[spec/design_output/pull#the-bless]]
test("an accept at a bless gate leaves the step on the gate", () => {
  const made = doors(
    standing(filled(GATED(), "## verdict", "accept"), undefined, EXTRA),
    {},
    { words: 5 },
  );
  heard(() => pulling(ROOT, ["pull"], made.it));
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(textOf(made), "step"), "gate", "the gate waits for its bless");
  assert.equal(fieldOf(textOf(made), "state"), "open");
  assert.match(textOf(made), /step: gate\n\s+hand: /, "the record keeps the verdict");
});

// [[spec/design_output/pull#the-bless]]
test("a pull of the waiting gate says it waits for a bless, and takes no hold", () => {
  const made = waiting();
  const said = heard(() => pulling(ROOT, ["pull"], made.it));

  assert.match(said.said, /bless/, said.said);
  assert.equal(made.disk.exists(HOLD), false, "no hand holds the gate");
  assert.equal(fieldOf(textOf(made), "step"), "gate");
});

// [[spec/design_output/pull#the-bless]]
test("an agent at a desk without the bless file is refused the bless", () => {
  const made = waiting({ agent: true }, {}, true);
  const said = blessing(made);

  assert.notEqual(said.code, 0, said.said);
  assert.match(said.said, /\.se\/\.runtime\/bless\.json/, "the refusal names the file");
  assert.equal(fieldOf(textOf(made), "step"), "gate", "the gate waits still");
  assert.doesNotMatch(textOf(made), BLESSED);
});

// [[spec/design_output/pull#the-bless]]
test("an agent at a desk blesses where the bless file holds agent true", () => {
  const made = waiting(
    { agent: true },
    { [BLESS_FILE]: JSON.stringify({ agent: true }) },
    true,
  );
  const said = blessing(made);

  assert.equal(said.code, 0, said.said);
  assert.equal(fieldOf(textOf(made), "step"), "implement/change", "the step moves on");
  assert.match(textOf(made), BLESSED, "the record carries the hash it blesses");
});

// [[spec/design_output/pull#the-bless]]
test("an agent at a desk with the bless file holding agent false is refused", () => {
  const made = waiting(
    { agent: true },
    { [BLESS_FILE]: JSON.stringify({ agent: false }) },
    true,
  );
  const said = blessing(made);

  assert.notEqual(said.code, 0, said.said);
  assert.match(said.said, /bless\.json/);
  assert.equal(fieldOf(textOf(made), "step"), "gate");
});

// [[spec/design_output/pull#the-bless]]
test("an agent on a cloud box blesses", () => {
  const made = waiting({ agent: true, cloud: true });
  const said = blessing(made);

  assert.equal(said.code, 0, said.said);
  assert.equal(fieldOf(textOf(made), "step"), "implement/change");
  assert.match(textOf(made), BLESSED);
});

// [[spec/design_output/pull#the-bless]]
test("a person blesses at a desk with no bless file", () => {
  const made = waiting({ agent: false, env: {} }, {}, true);
  const said = blessing(made);

  assert.equal(said.code, 0, said.said);
  assert.equal(fieldOf(textOf(made), "step"), "implement/change");
  assert.match(textOf(made), BLESSED);
});

// [[spec/design_output/pull#the-bless]]
test("a bless on a ticket at no bless gate is refused", () => {
  const plain = WAITING.replace("    bless: true\n", "");
  const made = doors(standing(plain, undefined, EXTRA), {}, { words: 5 });
  const said = blessing(made);

  assert.notEqual(said.code, 0, said.said);
  assert.match(said.said, /bless/);
  assert.doesNotMatch(textOf(made), BLESSED);
});

// [[spec/design_output/pull#the-bless]]
test("a payload into an input chapter strips the bless", () => {
  const made = waiting({ agent: true, cloud: true });
  blessing(made);
  const blessed = textOf(made);
  assert.match(blessed, BLESSED, "the bless stands first");

  assert.match(blessKept(blessed), BLESSED, "an unedited chapter keeps the bless");
  const edited = blessed.replace("The approach.", "Another approach.");
  assert.doesNotMatch(
    blessKept(edited),
    BLESSED,
    "an edit to an input chapter strips it",
  );
  const talk = blessed.replace("# Discussion\n", "# Discussion\n\n- A line.\n");
  assert.match(blessKept(talk), BLESSED, "a chapter the bless reads nowhere keeps it");
});

// [[spec/design_output/pull#the-bless]]
test("an edit off the engine puts the step back on the gate at the hand-out", () => {
  const made = waiting({ agent: true, cloud: true });
  blessing(made);
  assert.equal(fieldOf(textOf(made), "step"), "implement/change", "the bless moves on");

  made.disk.write(TICKET, textOf(made).replace("The approach.", "An edit by hand."));
  heard(() => pulling(ROOT, ["pull"], made.it));

  assert.equal(fieldOf(textOf(made), "step"), "gate", "the gate waits again");
  assert.doesNotMatch(textOf(made), BLESSED, "the stale bless drops");
});
