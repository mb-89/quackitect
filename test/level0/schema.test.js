// The schema reader and the note checker. Every keyword a schema holds takes a
// case that feeds a bad note and reads the finding it answers, because a case
// asserting nothing passes whatever the checker does.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkNote,
  itemsIn,
  kindOf,
  mintNote,
  readNote,
  readYaml,
  schemaFaults,
  schemasIn,
  SEVERITY,
} from "../../.claude/skills/level0/lib/schema.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

const SCHEMA = readYaml(`
kind: note

frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
    - status
  properties:
    kind:
      const: note
      x-link: true
      description: the schema this note is minted from

    status:
      enum: [todo, held, done]
      description: where the work stands

    scope:
      type: array
      description: who this note binds

    explains:
      x-link: true
      description: the note these chapters argue for

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Scope
      required: true
      description: what this note covers

    - header: Actionables
      required: true
      list: true
      ordered: true
      maxItems: 2
      description: one rule per item

      subsections:
        headingLevel: 2
        numbered: true
        order: strict
        description: one chapter per marked item

    - header: What stands open
      position: last
      required: true
      description: every question still waiting
`);

const NOTE = "spec/notes/one.md";

const good = `---
kind: [[note]]
status: todo
---

# Scope

What this note covers.

# Actionables

1. Do the first thing.
2. Do the second thing.

## 1. The first

Why it stands.

## 2. The second

Why it stands.

# What stands open

Nothing waits.
`;

const found = (text) => checkNote(text, SCHEMA, NOTE);
const rules = (text) => found(text).map((one) => one.rule);
const messages = (text) => found(text).map((one) => one.message);
const swap = (was, now) => good.replace(was, now);

test("the schema reads as a map, a list, a flow list and a link", () => {
  assert.equal(SCHEMA.kind, "note");
  assert.deepEqual(SCHEMA.frontmatter.required, ["kind", "status"]);
  assert.deepEqual(SCHEMA.frontmatter.properties.status.enum, ["todo", "held", "done"]);
  assert.equal(SCHEMA.frontmatter.properties.kind["x-link"], true);
  assert.equal(SCHEMA.body.sections.length, 3);
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
  assert.equal(SEVERITY, "error", "every note stands at its shape, so a departure turns check red");
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

const treeWith = (seed) =>
  treeOf({
    disk: fakeDisk(
      Object.fromEntries(Object.entries(seed).map(([at, s]) => [`/t/${at}`, s])),
    ),
    git: fakeGit({ "git ls-files": { stdout: Object.keys(seed).join("\n") } }, "/t"),
    root: "/t",
    words: 5,
    node: "",
  });

const SCHEMA_TEXT = `kind: note

frontmatter:
  additionalProperties: false
  required:
    - kind
  properties:
    kind:
      const: note
      x-link: true

body:
  headingLevel: 1
  extraSections: false
  sections:
    - header: Scope
      required: true
      description: what this note covers
`;

test("the sweep reads every schema in the folder", () => {
  const tree = treeWith({ "spec/schemas/note.schema.yaml": SCHEMA_TEXT });
  assert.deepEqual([...schemasIn(tree).keys()], ["note"]);
});

test("the sweep names the note departing, and passes over the note that holds", () => {
  const tree = treeWith({
    "spec/schemas/note.schema.yaml": SCHEMA_TEXT,
    "spec/notes/bad.md": "---\nkind: [[note]]\n---\n\n# Stranger\n\nA chapter.\n",
    "spec/notes/good.md": "---\nkind: [[note]]\n---\n\n# Scope\n\nWhat it covers.\n",
    "README.md": "# A file carrying no kind\n",
  });

  const said = schemaFaults(tree);
  assert.deepEqual([...new Set(said.map((one) => one.file))], ["spec/notes/bad.md"]);
  assert.deepEqual(said.map((one) => one.rule).sort(), [
    "Schema.Scope",
    "Schema.Stranger",
  ]);
});

test("a note naming a kind no schema holds is refused", () => {
  const tree = treeWith({
    "spec/schemas/note.schema.yaml": SCHEMA_TEXT,
    "spec/notes/other.md":
      "---\nkind: [[stranger]]\n---\n\n# Scope\n\nWhat it covers.\n",
  });

  const said = schemaFaults(tree);
  assert.equal(said.length, 1);
  assert.equal(said[0].rule, "Schema.Kind");
  assert.match(said[0].message, /stranger names no schema/);
});

// [[spec/design_output/schema#the-underscore-parks-a-draft]]
test("a draft parked under an underscore reaches no rule in the sweep", () => {
  const tree = treeWith({
    "spec/schemas/note.schema.yaml": SCHEMA_TEXT,
    "spec/notes/_draft.md": "---\nkind: [[note]]\n---\n\n# Stranger\n\nA chapter.\n",
  });

  assert.deepEqual(schemaFaults(tree), []);
  assert.deepEqual(tree.paths(), ["spec/schemas/note.schema.yaml"]);
});
