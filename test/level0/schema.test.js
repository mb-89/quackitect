// The schema reader and the note checker: a note against the schema its kind names.
// Every keyword a schema holds takes a case that feeds a bad note and reads the
// finding it answers, because a case asserting nothing passes whatever the
// checker does.

import assert from "node:assert/strict";
import { test } from "node:test";
import { checkNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import * as yaml from "../../.claude/skills/level0/lib/schema-yaml.js";
import { itemsIn } from "../../.claude/skills/level0/lib/schema-body.js";
import { SEVERITY } from "../../.claude/skills/level0/lib/schema-fault.js";
import { mintNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { kindOf, readNote } from "../../.claude/skills/level0/lib/schema-read.js";
import { cellsOf, rowsIn } from "../../.claude/skills/level0/lib/schema-table.js";
import { found, good, messages, NOTE, rules, SCHEMA, shown, swap } from "./schema-notes.js";

const withTable = (table = shown) =>
  good.replace("# What stands open", `${table}# What stands open`);
const lineOf = (text, line) => text.split(/\n/)[line - 1];

test("the schema reads as a map, a list, a flow list and a link", () => {
  assert.equal(SCHEMA.kind, "note");
  assert.deepEqual(SCHEMA.frontmatter.required, ["kind", "status"]);
  assert.deepEqual(SCHEMA.frontmatter.properties.status.enum, ["todo", "held", "done"]);
  assert.equal(SCHEMA.frontmatter.properties.kind["x-link"], true);
  assert.equal(SCHEMA.body.sections.length, 4);
  assert.equal(SCHEMA.body.sections[1].maxItems, 2);
  assert.equal(SCHEMA.body.sections[1].subsections.numbered, true);
  assert.equal(readYaml("kind: [[guidance]]\n").kind, "[[guidance]]");
});

test("a note in the shape its schema names breaks no rule", () => {
  assert.deepEqual(found(good), []);
});

// [[spec/design_output/schema#the-door-refuses-a-departure]]
test("every finding carries the shape this tree prints, at error", () => {
  const one = found(swap("status: todo\n", ""))[0];
  assert.deepEqual(Object.keys(one).sort(), [
    "column",
    "file",
    "line",
    "message",
    "rule",
    "severity",
  ]);
  assert.equal(one.file, NOTE);
  assert.equal(one.column, 1);
  assert.equal(one.severity, SEVERITY);
  assert.equal(
    SEVERITY,
    "error",
    "every note stands at its shape, so a departure turns check red",
  );
});

test("a note short of a required field is refused", () => {
  assert.ok(rules(swap("status: todo\n", "")).includes("Schema.status"));
  assert.match(messages(swap("status: todo\n", ""))[0], /names status/);
});

test("a note carrying a field the schema never names is refused", () => {
  const bad = swap("status: todo\n", "status: todo\nabout: a thing\n");
  assert.ok(rules(bad).includes("Schema.about"));
  assert.match(messages(bad).join(" "), /names no about/);
  assert.equal(found(bad)[0].line, 4, "it points at the line holding the field");
});

test("a note whose kind reads as another kind is refused", () => {
  const bad = swap("kind: [[note]]", "kind: [[other]]");
  assert.ok(rules(bad).includes("Schema.kind"));
  assert.match(messages(bad).join(" "), /a note note names note/);
});

test("a field off the enum is refused, and one on it passes", () => {
  const bad = swap("status: todo", "status: later");
  assert.ok(rules(bad).includes("Schema.status"));
  assert.match(messages(bad).join(" "), /todo, held, done/);
  assert.deepEqual(found(swap("status: todo", "status: done")), []);
});

test("a field taking a list, written as one line, is refused", () => {
  const bad = swap("status: todo\n", "status: todo\nscope: one line\n");
  assert.ok(rules(bad).includes("Schema.scope"));
  assert.match(messages(bad).join(" "), /takes array/);
  assert.deepEqual(found(swap("status: todo\n", 'status: todo\nscope: ["all"]\n')), []);
});

test("a field naming a link, written bare, is refused", () => {
  const bad = swap("status: todo\n", "status: todo\nexplains: spec/guidance/voice\n");
  assert.ok(rules(bad).includes("Schema.explains"));
  assert.match(messages(bad).join(" "), /names a link/);
  const linked = swap(
    "status: todo\n",
    "status: todo\nexplains: [[spec/guidance/voice]]\n",
  );
  assert.deepEqual(found(linked), []);
});

test("a note opening with no frontmatter is refused", () => {
  const bad = good.replace(/^---\n[\s\S]*?\n---\n\n/, "");
  assert.deepEqual(rules(bad), ["Schema.Frontmatter"]);
});

test("a note short of a required chapter is refused", () => {
  const bad = swap("# Scope\n\nWhat this note covers.\n\n", "");
  assert.ok(rules(bad).includes("Schema.Scope"));
  assert.match(messages(bad).join(" "), /carries a Scope chapter/);
});

test("a chapter the schema never names is refused", () => {
  const bad = `${good}\n# Stranger\n\nA chapter nobody names.\n`;
  assert.ok(rules(bad).includes("Schema.Stranger"));
  assert.match(messages(bad).join(" "), /names no Stranger chapter/);
});

test("a chapter out of the order the schema names is refused", () => {
  const bad = good
    .replace("# Scope\n\nWhat this note covers.\n\n", "")
    .replace(
      "# Actionables",
      "# Actionables\n\nOne line.\n\n# Scope\n\nWhat this covers.\n\n# Actionables",
    );
  assert.match(messages(bad).join(" "), /stands after/);
});

test("a closing chapter with another after it is refused", () => {
  const bad = `${good}\n# Scope\n\nA second scope.\n`;
  assert.match(messages(bad).join(" "), /closes this note, and Scope stands after it/);
});

test("a chapter holding no list, where the schema names one, is refused", () => {
  const bad = swap(
    "1. Do the first thing.\n2. Do the second thing.",
    "Two things, said as prose.",
  );
  assert.ok(rules(bad).includes("Schema.Actionables"));
  assert.match(messages(bad).join(" "), /holds a list/);
});

test("a list the schema numbers, written with bullets, is refused", () => {
  const bad = swap(
    "1. Do the first thing.\n2. Do the second thing.",
    "- Do the first thing.\n- Do the second thing.",
  );
  assert.ok(rules(bad).includes("Schema.Actionables"));
  assert.match(messages(bad).join(" "), /numbers every item/);
});

test("a list past the cap is refused, and it points at the item past it", () => {
  const bad = swap(
    "2. Do the second thing.",
    "2. Do the second thing.\n3. Do the third thing.",
  );
  const one = found(bad).find((said) => /A note holds 2 items\./.test(said.message));
  assert.ok(one, "the cap answers the count the schema names");
  assert.equal(bad.split(/\n/)[one.line - 1], "3. Do the third thing.");
});

test("a chapter under a numbered one, opening with no number, is refused", () => {
  const bad = swap("## 1. The first", "## The first");
  assert.ok(rules(bad).includes("Schema.Actionables"));
  assert.match(messages(bad).join(" "), /opens with the number/);
});

test("numbered chapters running back down are refused", () => {
  const bad = swap("## 1. The first", "## 4. The fourth");
  assert.match(messages(bad).join(" "), /the numbers run up/);
});

// [[spec/design_output/schema#a-chapter-holds-a-table]]
test("a chapter holding the table its schema names, one row per item, passes", () => {
  assert.deepEqual(found(withTable()), []);
  assert.deepEqual(rowsIn(shown.split("\n")).map((one) => one.line), [3, 5, 6]);
  assert.deepEqual(cellsOf("| 1 | do | do not |"), ["1", "do", "do not"]);
});

test("a chapter holding no table, where the schema names one, is refused", () => {
  const bad = withTable("# Examples\n\nTwo rows, said as prose.\n\n");
  assert.ok(rules(bad).includes("Schema.Examples"));
  assert.match(messages(bad).join(" "), /holds a table headed the rule, do, do not/);
});

test("a table opening with other heads is refused, at the head row", () => {
  const bad = withTable(shown.replace("| the rule | do | do not |", "| rule | yes | no |"));
  const one = found(bad).find((said) => /opens with the heads/.test(said.message));
  assert.ok(one, "the heads answer the schema");
  assert.equal(lineOf(bad, one.line), "| rule | yes | no |");
});

test("a table takes several rows for one item and none for another", () => {
  const twice = withTable(shown.replace("| 2 | do the second", "| 1 | do the second"));
  assert.deepEqual(found(twice), []);
  const one = withTable(shown.replace("| 2 | do the second thing | leave it |\n", ""));
  assert.deepEqual(found(one), []);
});

test("a row naming no item of the list is refused, and rows running back down too", () => {
  const off = withTable(shown.replace("| 2 | do the second", "| 3 | do the second"));
  const one = found(off).find((said) =>
    /opens with the number of an item of Actionables/.test(said.message),
  );
  assert.ok(one, "the row names its item");
  assert.match(one.message, /opens with 3\./);
  assert.equal(lineOf(off, one.line), "| 3 | do the second thing | leave it |");
  const bare = withTable(shown.replace("| 2 | do the second", "| | do the second"));
  assert.match(messages(bare).join(" "), /opens with nothing\./);
  const back = withTable(
    shown
      .replace("| 1 | do the first", "| 2 | do the first")
      .replace("| 2 | do the second", "| 1 | do the second"),
  );
  assert.match(messages(back).join(" "), /for item 1 stands after one for item 2/);
});

test("a comment and a fenced block count toward no bound", () => {
  const said = itemsIn([
    "<!-- 1. a description mint writes -->",
    "1. A real item.",
    "```",
    "2. A line inside a fence.",
    "```",
  ]);
  assert.deepEqual(
    said.map((one) => one.said),
    ["1. A real item."],
  );
});

test("a minted note passes the checker of the kind it is minted from", () => {
  const text = mintNote(SCHEMA);
  assert.deepEqual(checkNote(text, SCHEMA, NOTE), []);
  assert.match(text, /^---\nkind: \[\[note\]\]\nstatus: todo\n---/);
  assert.match(text, /<!-- one rule per item -->/);
  assert.match(text, /\n1\. /, "a list section carries the item the schema names");
});

test("a note names its kind through the link its frontmatter carries", () => {
  assert.equal(kindOf(good), "note");
  assert.equal(kindOf("# No frontmatter\n"), "");
  assert.equal(readNote(good).sections[0].header, "Scope");
});

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
test("an empty process holds back the keys the fill writes, and a missing one holds back nothing", () => {
  const schema = readYaml(`kind: ticket
frontmatter:
  type: object
  required: [kind, state, steps]
  properties:
    kind:
      const: ticket
      x-link: true
    state:
      enum: [draft, open]
      x-filled-by: process
    steps:
      type: array
      x-filled-by: process
    process:
      x-link: true
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
`);
  const fresh = "---\nkind: [[ticket]]\nprocess:\n---\n\n# Ask\n\nA thing.\n";
  const keys = (text) =>
    checkNote(text, schema, "spec/tickets/a.md")
      .map((one) => one.rule)
      .filter((rule) => /state|steps/.test(rule))
      .sort();
  assert.deepEqual(keys(fresh), []);
  assert.deepEqual(keys(fresh.replace("process:\n", "")), ["Schema.state", "Schema.steps"]);
});

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
test("a process the note names holds back nothing, so a missing route stands named", () => {
  const schema = readYaml(`kind: ticket
frontmatter:
  type: object
  required: [kind, steps]
  properties:
    kind:
      const: ticket
      x-link: true
    steps:
      type: array
      x-filled-by: process
    process:
      x-link: true
`);
  const said = checkNote("---\nkind: [[ticket]]\nprocess: [[spec/processes/trivial]]\n---\n", schema, "a.md");
  assert.ok(said.some((one) => one.rule === "Schema.steps"));
});

// [[spec/tickets/the-quoted-pair-stays-paired]]
test("a list item quoted whole reads as text, and a quoted key with a quoted value stays a pair", () => {
  const read = readYaml(
    'checklist:\n  - "no sentence says: a count, a member"\n  - \'single: text\'\n  - "a": "b"\n',
  );
  assert.deepEqual(read.checklist, [
    "no sentence says: a count, a member",
    "single: text",
    { '"a"': "b" },
  ]);
  assert.equal(yaml.quotedWhole('"a \\" b: c"'), true);
  assert.equal(yaml.quotedWhole('"a": "b"'), false);
});
