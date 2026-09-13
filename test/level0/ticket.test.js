// The ticket door. Each case hands the door one write and reads the finding it
// answers, because a case asserting nothing passes whatever the door does.
// [[spec/design_output/schema#the-three-places]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { readNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import {
  engineRows,
  placesIn,
  refusedTicket,
  ticketFaults,
} from "../../.claude/skills/level0/lib/ticket.js";

const SCHEMA = readYaml(`
kind: ticket

frontmatter:
  type: object
  required:
    - kind
  properties:
    kind:
      const: ticket
      x-link: true
      description: the schema this note is minted from

    state:
      enum: [draft, open, closed]
      x-engine: true
      description: whether anybody pulls it

    step:
      type: string
      x-engine: true
      description: the leaf this ticket stands on

    steps:
      type: array
      x-engine: true
      description: the route

    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first

body:
  headingLevel: 1

  sections:
    - header: Ask
      required: true
      x-written: draft
      description: what this ticket asks for

    - x-one-per: steps
      x-written: hand

    - header: Discussion
      required: true
      position: last
      x-written: anyone
      description: what anybody adds
`);

const WHERE = "spec/tickets/a-name.md";

const open = `---
kind: [[ticket]]
state: open
urgency: now
step: implement/change
steps:
  - name: design
    does: writes the design
  - name: implement
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            says: the tree builds and lints
          - name: seen
            form: text
            says: what surprises you
---

# Ask

What it asks for.

# design

# implement

## change

### lint

### seen

# Discussion

Nothing yet.
`;

const weighed = (now, was = open) => ticketFaults(was, now, SCHEMA, WHERE);
const rules = (now, was) => weighed(now, was).map((one) => one.rule);

// [[spec/design_output/schema#the-three-places]]
test("a write to the field of the step in hand stands", () => {
  assert.deepEqual(weighed(open.replace("### lint\n", "### lint\n\nnpm test\n")), []);
  assert.deepEqual(
    weighed(open.replace("### seen\n", "### seen\n\nThe fix is small.\n")),
    [],
  );
});

// [[spec/design_output/schema#the-three-places]]
test("a write to the discussion stands, at any state", () => {
  assert.deepEqual(weighed(open.replace("Nothing yet.", "One thing stands open.")), []);
});

// [[spec/design_output/schema#the-three-places]]
test("a write to the ask of an open ticket is refused, and a draft takes it", () => {
  const said = open.replace("What it asks for.", "What it really asks for.");
  assert.deepEqual(rules(said), ["Ticket.Ask"]);
  assert.match(weighed(said)[0].message, /is the engine's to write/);

  const draft = open.replace("state: open", "state: draft");
  assert.deepEqual(
    ticketFaults(
      draft,
      draft.replace("What it asks for.", "What it asks for now."),
      SCHEMA,
      WHERE,
    ),
    [],
  );
});

// [[spec/design_output/schema#the-three-places]]
test("a write to a phase's chapter is refused", () => {
  const said = open.replace("# design\n", "# design\n\nA line nobody asks for.\n");
  assert.deepEqual(rules(said), ["Ticket.design"]);
});

// [[spec/design_output/schema#the-three-places]]
test("a write to the field of another leaf is refused", () => {
  const other = open.replace("step: implement/change", "step: design");
  const said = other.replace("### lint\n", "### lint\n\nnpm test\n");
  assert.deepEqual(rules(said, other), ["Ticket.lint"]);
});

// [[spec/design_output/schema#the-verbs-own-three-fields]]
test("an edit to a field the verbs own is refused, and the line points at it", () => {
  for (const [was, now, rule, line] of [
    ["state: open", "state: closed", "Ticket.state", 3],
    ["step: implement/change", "step: design", "Ticket.step", 5],
    ["    does: makes the change", "    does: makes it", "Ticket.steps", 6],
  ]) {
    const found = weighed(open.replace(was, now));
    assert.deepEqual(
      found.map((one) => one.rule),
      [rule],
      `${now} reaches ${rule}`,
    );
    assert.equal(found[0].line, line);
  }
});

// [[spec/design_output/schema#the-verbs-own-three-fields]]
test("a field no rule marks stands, so a person's fields reach no door", () => {
  assert.deepEqual(weighed(open.replace("urgency: now", "urgency: soon")), []);
});

// [[spec/design_output/schema#the-three-places]]
test("a file nothing stands in yet is a mint, and the door asks it nothing", () => {
  assert.deepEqual(ticketFaults("", open, SCHEMA, WHERE), []);
});

// [[spec/design_output/schema#the-three-places]]
test("the places answer the ask of a draft, the step's fields and the discussion", () => {
  assert.deepEqual(
    [...placesIn(readNote(open), SCHEMA).keys()],
    ["3 lint", "3 seen", "1 Discussion"],
  );
  assert.deepEqual(
    [...placesIn(readNote(open.replace("state: open", "state: draft")), SCHEMA).keys()],
    ["1 Ask", "3 lint", "3 seen", "1 Discussion"],
  );
});

// [[spec/design_output/schema#the-three-places]]
test("a ticket standing at no leaf of its route offers a hand no field", () => {
  const said = open.replace("step: implement/change", "step: nowhere");
  assert.deepEqual([...placesIn(readNote(said), SCHEMA).keys()], ["1 Discussion"]);
});

const recorded = open.replace(
  "steps:\n",
  `record:
  - step: implement/change
    hand: a box, a session and an agent
    took: abc1234
    gave: def5678
    returns: 1
    answered:
      - name: lint
        exit: 0
        said: the tree lints
steps:
`,
);

// [[spec/design_output/schema#the-record-draws-itself]]
test("the record draws a line under its leaf, and one under a command field", () => {
  assert.deepEqual(engineRows(readNote(recorded), SCHEMA), [
    {
      key: "2 change",
      said:
        "The hand is `a box, a session and an agent`, and the branch runs `abc1234` to `def5678`, and this leaf returns 1.",
    },
    {
      key: "3 lint",
      said: "answered: exit `0`, and the last line reads `the tree lints`.",
    },
  ]);
});

// [[spec/design_output/schema#the-record-draws-itself]]
test("a skipped leaf draws the reason the pull passes it over", () => {
  const said = recorded
    .replace("    returns: 1", "    skipped: true\n    why: the box runs on a desk")
    .replace(/ {4}answered:\n(?: {6}.*\n| {8}.*\n)+/, "");
  assert.deepEqual(engineRows(readNote(said), SCHEMA), [
    { key: "2 change", said: "The pull skips this leaf, because the box runs on a desk." },
  ]);
});

// [[spec/design_output/schema#the-record-draws-itself]]
test("an answered line the record says stands, and one it fails to say refuses", () => {
  const drawn = recorded.replace(
    "### lint\n",
    "### lint\n\nanswered: exit `0`, and the last line reads `the tree lints`.\n",
  );
  assert.deepEqual(ticketFaults(recorded, drawn, SCHEMA, WHERE), []);

  const claimed = recorded.replace("### lint\n", "### lint\n\nanswered: exit `0`.\n");
  const found = ticketFaults(recorded, claimed, SCHEMA, WHERE);
  assert.deepEqual(
    found.map((one) => one.rule),
    ["Ticket.lint"],
  );
  assert.match(found[0].message, /An answered line is the engine's/);
});

// [[spec/design_output/schema#the-record-draws-itself]]
test("an answered line on a leaf with no record entry refuses", () => {
  const claimed = open.replace("### lint\n", "### lint\n\nanswered: exit `0`.\n");
  assert.deepEqual(
    ticketFaults(open, claimed, SCHEMA, WHERE).map((one) => one.rule),
    ["Ticket.lint"],
  );
});

// [[spec/design_output/schema#the-three-places]]
test("the refusal names the finding and the three places", () => {
  const said = refusedTicket(
    WHERE,
    "ticket",
    weighed(open.replace("state: open", "state: closed")),
  );
  assert.match(
    said,
    /^The ticket door refuses this write to spec\/tickets\/a-name\.md\./,
  );
  assert.match(said, /Ticket\.state/);
  assert.match(
    said,
    /the ask of a draft, the fields of the step it holds, and the discussion/,
  );
});
