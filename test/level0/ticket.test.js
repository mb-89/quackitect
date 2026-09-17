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
  queueHolds,
  ticketFaults,
} from "../../.claude/skills/level0/lib/ticket.js";

const SCHEMA_TEXT = `
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
      x-written: anyone
      description: what this ticket asks for

    - x-one-per: steps
      x-written: hand

    - header: Discussion
      required: true
      position: last
      x-written: anyone
      description: what anybody adds
`;
const SCHEMA = readYaml(SCHEMA_TEXT);

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
test("a write to the ask stands at any state, so a hand fixes what the rules refuse", () => {
  assert.deepEqual(weighed(open.replace("What it asks for.", "What it asks for now.")), []);

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

test("a section written by one state alone refuses the others", () => {
  const drafted = readYaml(String(SCHEMA_TEXT).replace("x-written: anyone\n      description: what this ticket asks for", "x-written: draft\n      description: what this ticket asks for"));
  const said = open.replace("What it asks for.", "What it really asks for.");
  const found = ticketFaults(open, said, drafted, WHERE);
  assert.deepEqual(found.map((one) => one.rule), ["Ticket.Ask"]);
  assert.match(found[0].message, /is the engine's to write/);
});

// [[spec/design_output/schema#the-three-places]]
test("a write to a phase's chapter is refused", () => {
  const said = open.replace("# design\n", "# design\n\nA line nobody asks for.\n");
  assert.deepEqual(rules(said), ["Ticket.design"]);
});

// [[spec/design_output/schema#the-three-places]]
test("two leaves naming one field alike stand apart, so a write beside them passes", () => {
  const twice = open
    .replace("# implement\n", "# implement\n\n## first\n\n### tests\n\n<!-- the first -->\n")
    .replace("# Discussion", "## second\n\n### tests\n\n<!-- the second -->\n\n# Discussion");
  assert.deepEqual(weighed(twice, twice), []);
  assert.deepEqual(weighed(twice.replace("### lint\n", "### lint\n\nnpm test\n"), twice), []);
});

// [[spec/design_output/schema#the-three-places]]
test("a write to the field of another leaf is refused", () => {
  const other = open.replace("step: implement/change", "step: design");
  const said = other.replace("### lint\n", "### lint\n\nnpm test\n");
  assert.deepEqual(rules(said, other), ["Ticket.lint"]);
});

// [[spec/design_output/schema#the-verbs-own-their-fields]]
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

// [[spec/design_output/schema#the-verbs-own-their-fields]]
test("a field no rule marks stands, so a person's fields reach no door", () => {
  assert.deepEqual(weighed(open.replace("urgency: now", "urgency: soon")), []);
});

// [[spec/design_output/schema#the-three-places]]
test("a file nothing stands in yet is a mint, and the door asks it nothing", () => {
  assert.deepEqual(ticketFaults("", open, SCHEMA, WHERE), []);
});

// [[spec/design_output/schema#the-three-places]]
test("the places answer the ask, the step's fields and the discussion, at any state", () => {
  assert.deepEqual(
    [...placesIn(readNote(open), SCHEMA).keys()],
    ["1 Ask", "3 lint", "3 seen", "1 Discussion"],
  );
  assert.deepEqual(
    [...placesIn(readNote(open.replace("state: open", "state: draft")), SCHEMA).keys()],
    ["1 Ask", "3 lint", "3 seen", "1 Discussion"],
  );
});

// [[spec/design_output/schema#the-three-places]]
test("a ticket standing at no leaf of its route offers a hand no field", () => {
  const said = open.replace("step: implement/change", "step: nowhere");
  assert.deepEqual([...placesIn(readNote(said), SCHEMA).keys()], ["1 Ask", "1 Discussion"]);
});

// [[spec/design_output/schema#the-three-places]]
test("a ticket with no step stands at its first leaf, so its fields open to the hand the pull gives it to", () => {
  const said = open
    .replace("step: implement/change\n", "")
    .replace("  - name: design\n    does: writes the design\n", "");
  assert.deepEqual(
    [...placesIn(readNote(said), SCHEMA).keys()],
    ["1 Ask", "3 lint", "3 seen", "1 Discussion"],
    "the first leaf's fields stand open",
  );
});

const recorded = open.replace(
  "steps:\n",
  `record:
  - step: implement/change
    hand: a box, a session and an agent
    hash_before: abc1234
    hash_after: def5678
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
    /the ask, the fields of the step it holds, and the discussion/,
  );
});

// [[spec/design_output/stop#the-mechanical-checks]]
test("the queue holds work where a free open ticket has a leaf a hand takes, or a group reads now", () => {
  const free = (state, by = "anyone", more = "") =>
    `---\nkind: [[ticket]]\nstate: ${state}\nurgency: soon\n${more}steps:\n  - name: do\n    by: ${by}\n---\n\n# Ask\n\nA thing.\n`;
  assert.equal(queueHolds([free("open")]), true, "an open free ticket");
  assert.equal(queueHolds([free("draft")]), false, "a draft waits for its open");
  assert.equal(queueHolds([free("closed")]), false, "a closed one is done");
  assert.equal(queueHolds([free("open", "person")]), false, "a person step is nobody's on this box");
  assert.equal(queueHolds([free("open", "anyone", "group: some-group\n")]), false, "a child rides its group");
  const group = (urgency) =>
    `---\nkind: [[ticket]]\nstate: open\nurgency: ${urgency}\nprocess: [[spec/processes/group]]\nsteps:\n  - name: split\n---\n\n# Ask\n\nA group.\n`;
  assert.equal(queueHolds([group("soon")]), false, "a group at soon is the cloud's");
  assert.equal(queueHolds([group("now")]), true, "a group at now is the desk's");
  assert.equal(queueHolds([]), false);
});
