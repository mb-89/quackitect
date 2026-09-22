// The schema reader and the note checker: a bare yaml file, the slots a route fills, and the hash it reads as.
// A process file carries no frontmatter, so a case here weighs the whole file and
// reads what a reroute keeps.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkData,
  isDataSchema,
  isNoteSchema,
  readYaml,
  schemaFaults,
} from "../../.claude/skills/level0/lib/schema.js";
import { reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";
import { processHash, slotFaults } from "../../.claude/skills/level0/lib/schema-route.js";
import { GOVERNED, ROUTED, routed, treeWith } from "./schema-notes.js";

const PROCESS = readYaml(`
kind: process

governs:
  - spec/processes/*.yaml

data:
  type: object
  additionalProperties: false
  required:
    - steps
  properties:
    steps:
      $ref: "routed#/frontmatter/properties/steps"
      description: the route
`);

const every = new Map([
  ["routed", ROUTED],
  ["process", PROCESS],
]);

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
test("a data schema reads a bare yaml file, and names no note kind", () => {
  assert.equal(isDataSchema(PROCESS), true);
  assert.equal(isNoteSchema(PROCESS), false);
  assert.equal(isDataSchema(ROUTED), false);
  assert.deepEqual(
    checkData(
      "steps:\n  - name: do\n    does: makes it\n",
      PROCESS,
      "spec/processes/one.yaml",
      every,
    ),
    [],
  );
});

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
test("a bare yaml file short of a required key is refused, naming the file", () => {
  const one = checkData(
    "about: a thing\n",
    PROCESS,
    "spec/processes/one.yaml",
    every,
  )[0];
  assert.equal(one.rule, "Schema.steps");
  assert.match(one.message, /A process names steps in its file/);
});

// [[spec/design_output/schema#one-home-for-a-shape]]
test("a pointer across schemas resolves, and a fault in the route names its line", () => {
  const text = "steps:\n  - name: do\n    on_fail: nowhere\n";
  const one = checkData(text, PROCESS, "spec/processes/one.yaml", every)[0];
  assert.equal(one.rule, "Schema.OnFail");
  assert.equal(one.line, 3);
});

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
test("the sweep reads a yaml file under a data schema", () => {
  const said = treeWith({
    "spec/schemas/note.schema.yaml": GOVERNED,
    "spec/schemas/process.schema.yaml":
      "kind: process\n\ngoverns:\n  - spec/processes/*.yaml\n\ndata:\n  type: object\n  additionalProperties: false\n  required:\n    - steps\n  properties:\n    steps:\n      type: array\n",
    "spec/processes/one.yaml": "about: a thing\n",
  });
  const out = schemaFaults(said).filter(
    (one) => one.file === "spec/processes/one.yaml",
  );
  assert.deepEqual(
    out.map((one) => one.rule),
    ["Schema.steps", "Schema.about"],
  );
});

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
const slotted = (steps) => slotFaults(readYaml(steps), "spec/processes/one.yaml");

test("an output nothing reads is refused, and it names the field", () => {
  const found = slotted(`
steps:
  - name: do
    does: makes it
    evidence:
      - name: says
        form: text
        says: what you change
`);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Schema.Output");
  assert.match(found[0].message, /do writes says, and nothing reads it/);
});

test("an input nothing supplies is refused, and it names the token", () => {
  const found = slotted(`
steps:
  - name: do
    does: makes it
    input: nowhere
    to: retro
`);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Schema.Input");
  assert.match(found[0].message, /do reads nowhere/);
});

test("a route carrying both takes both findings", () => {
  const found = slotted(`
steps:
  - name: do
    does: makes it
    input: later
    evidence:
      - name: says
        form: text
        says: what you change
  - name: later
    does: reads it
    to: retro
`);
  assert.deepEqual(found.map((one) => one.rule).sort(), [
    "Schema.Input",
    "Schema.Output",
  ]);
});

test("a later step reading it, a to, or an engine form answers the output", () => {
  assert.deepEqual(
    slotted(`
steps:
  - name: first
    does: writes it
    evidence:
      - name: says
        form: text
        says: what you change
      - name: ran
        form: command
        expects: 0
        says: the check is green
  - name: second
    does: reads it
    input: says
    to: retro
`),
    [],
  );
});

test("an input reads ask, diff, an earlier step, or an earlier field", () => {
  assert.deepEqual(
    slotted(`
steps:
  - name: first
    does: writes it
    evidence:
      - name: approach
        form: text
        says: the approach
  - name: second
    does: reads it
    input: [ask, diff, first, approach]
    to: retro
`),
    [],
  );
});

test("a finding names the line the slot stands on", () => {
  const text =
    "steps:\n  - name: do\n    does: makes it\n    input: nowhere\n    to: retro\n";
  const lines = new Map();
  const said = readYaml(text, lines);
  const found = slotFaults(said, "spec/processes/one.yaml", Object.fromEntries(lines));
  assert.equal(found[0].line, 4);
});

test("a note carrying no route answers no slot finding", () => {
  assert.deepEqual(slotFaults({}, "spec/processes/one.yaml"), []);
});

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
const PROCESS_FILE = `
# A comment stands here.
for: a fix small enough that the ask is the design
ask:
  - name: gain
    form: text
    says: what is gained
steps:
  - name: do
    does: makes it
    to: retro
`;

test("a comment in a process file moves no hash", () => {
  const more = PROCESS_FILE.replace(
    "# A comment stands here.",
    "# Another comment, longer.\n# And a second line.",
  );
  assert.equal(processHash(more), processHash(PROCESS_FILE));
});

test("a reordered key in a process file moves no hash", () => {
  const swapped = PROCESS_FILE.replace(
    "  - name: do\n    does: makes it\n",
    "  - does: makes it\n    name: do\n",
  );
  assert.equal(processHash(swapped), processHash(PROCESS_FILE));
});

test("a changed step moves the hash", () => {
  const changed = PROCESS_FILE.replace("does: makes it", "does: makes it, with a test");
  assert.notEqual(processHash(changed), processHash(PROCESS_FILE));
});

test("a reordered step moves the hash, because the order is the route", () => {
  const two = `${PROCESS_FILE}  - name: check\n    does: reads it\n    to: retro\n`;
  const back = `
for: a fix small enough that the ask is the design
ask:
  - name: gain
    form: text
    says: what is gained
steps:
  - name: check
    does: reads it
    to: retro
  - name: do
    does: makes it
    to: retro
`;
  assert.notEqual(processHash(two), processHash(back));
});

test("the hash reads the route and the ask, and nothing else the file holds", () => {
  const said = PROCESS_FILE.replace(
    "for: a fix small enough that the ask is the design",
    "for: something else entirely",
  );
  assert.equal(processHash(said), processHash(PROCESS_FILE));
});

test("a route reads as a hash of its own, whichever way it arrives", () => {
  assert.equal(processHash(readYaml(PROCESS_FILE)), processHash(PROCESS_FILE));
});

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
test("a reroute keeps what a standing chapter holds, and writes the new one", () => {
  const was = `---
kind: [[routed]]
step: design/review
steps:
  - name: design
    steps:
      - name: draft
        does: writes the design
      - name: review
        does: reads the design
---

# Ask

What it asks for.

# design

## draft

The approach stands here.

## review

<!-- reads the design -->
`;
  const now = reRouted(was, ROUTED, [
    {
      name: "design",
      steps: [
        { name: "draft", does: "writes the design" },
        { name: "review", does: "reads the design" },
      ],
    },
    { name: "ship", does: "ships it" },
  ]);
  assert.match(now, /The approach stands here\./);
  assert.match(now, /^# ship$/m);
  assert.match(now, /<!-- ships it -->/);
  assert.deepEqual(routed(now), []);
});
