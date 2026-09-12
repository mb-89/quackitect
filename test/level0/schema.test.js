// The schema reader and the note checker. Every keyword a schema holds takes a
// case that feeds a bad note and reads the finding it answers, because a case
// asserting nothing passes whatever the checker does.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkNote,
  fieldsIn,
  governorOf,
  itemsIn,
  kindOf,
  MINT_TOOL,
  mintedNote,
  mintNote,
  mintSpec,
  placeholderFaults,
  readNote,
  readYaml,
  refusedKind,
  schemaFaults,
  schemasIn,
  SEVERITY,
  strangerFault,
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

// [[spec/design_output/schema#a-folder-names-its-kind]]
const GOVERNED = `kind: note

governs:
  - spec/notes/**

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

const governedTree = (seed) =>
  treeWith({ "spec/schemas/note.schema.yaml": GOVERNED, ...seed });

test("a schema answers which paths it governs, and a path outside reaches none", () => {
  const schemas = schemasIn(governedTree({}));
  assert.equal(governorOf(schemas, "spec/notes/one.md")?.kind, "note");
  assert.equal(governorOf(schemas, "spec/notes/deep/one.md")?.kind, "note");
  assert.equal(governorOf(schemas, "README.md"), null);
});

test("a schema describing no note reaches the reader nowhere", () => {
  const tree = treeWith({
    "spec/schemas/note.schema.yaml": GOVERNED,
    "spec/schemas/paragraph.schema.yaml": "kind: paragraph\n\nlayers:\n  shape:\n    sentencesPerParagraph: 6\n",
  });
  assert.deepEqual([...schemasIn(tree).keys()], ["note"]);
});

test("the sweep names a file carrying no kind, where a schema governs its folder", () => {
  const said = schemaFaults(
    governedTree({ "spec/notes/bare.md": "# A file carrying no kind\n" }),
  );
  assert.equal(said.length, 1);
  assert.equal(said[0].rule, "Schema.Kind");
  assert.match(said[0].message, /names no kind, and the note schema governs this path/);
});

test("the sweep names a note of another kind standing in a governed folder", () => {
  const tree = governedTree({
    "spec/schemas/other.schema.yaml": GOVERNED.replace(/note/g, "other").replace(
      "spec/other/**",
      "spec/other/**",
    ),
    "spec/notes/wrong.md": "---\nkind: [[other]]\n---\n\n# Scope\n\nWhat it covers.\n",
  });
  const said = schemaFaults(tree).filter((one) => one.file === "spec/notes/wrong.md");
  assert.equal(said.length, 1);
  assert.match(said[0].message, /reads as a other, and the note schema governs this path/);
});

test("a note of the governed kind is weighed as it is today", () => {
  const said = schemaFaults(
    governedTree({
      "spec/notes/good.md": "---\nkind: [[note]]\n---\n\n# Scope\n\nWhat it covers.\n",
      "spec/notes/bad.md": "---\nkind: [[note]]\n---\n\n# Stranger\n\nA chapter.\n",
    }),
  );
  assert.deepEqual([...new Set(said.map((one) => one.file))], ["spec/notes/bad.md"]);
});

// [[spec/design_output/schema#a-placeholder-stands-at-warning]]
test("a placeholder still standing is a finding at warning, and a filled field is none", () => {
  const text = mintNote(SCHEMA, { Scope: "What this note covers." });
  const said = placeholderFaults(text, SCHEMA, NOTE);
  assert.ok(said.length, "the chapters left out still carry their comment");
  assert.deepEqual([...new Set(said.map((one) => one.severity))], ["warning"]);
  assert.deepEqual([...new Set(said.map((one) => one.rule))], ["Schema.Placeholder"]);
  assert.ok(
    !said.some((one) => /^Scope /.test(one.message)),
    "the chapter the fields name carries no placeholder",
  );
  assert.equal(text.split(/\n/)[said[0].line - 1].trim().startsWith("<!--"), true);
});

test("a field off an enum counts as no placeholder, because mint writes a real value", () => {
  const said = placeholderFaults(mintNote(SCHEMA), SCHEMA, NOTE);
  assert.ok(
    !said.some((one) => /^status /.test(one.message)),
    "status: todo is a value the schema allows, not a placeholder",
  );
});

test("the sweep carries the placeholders a minted note still holds", () => {
  const said = schemaFaults(
    governedTree({ "spec/notes/fresh.md": "---\nkind: [[note]]\n---\n\n# Scope\n\n<!-- what this note covers -->\n" }),
  );
  assert.deepEqual(said.map((one) => one.rule), ["Schema.Placeholder"]);
  assert.equal(said[0].severity, "warning");
  assert.equal(said[0].line, 7);
});

// [[spec/design_output/schema#the-tool-writes-the-note]]
test("the tool writes a note the checker passes, and names what stands empty", () => {
  const schemas = schemasIn(governedTree({}));
  const made = mintedNote(schemas, {
    kind: "note",
    path: "spec/notes/fresh.md",
    fields: { Scope: "What this note covers." },
  });
  assert.equal(made.why, undefined);
  assert.deepEqual(checkNote(made.text, schemas.get("note"), made.path), []);
  assert.match(made.text, /# Scope\n\nWhat this note covers\./);
  assert.deepEqual(made.left, []);
});

test("the tool leaves a placeholder where a field stands absent, and names it", () => {
  const schemas = schemasIn(governedTree({}));
  const made = mintedNote(schemas, { kind: "note", path: "spec/notes/fresh.md" });
  assert.match(made.text, /<!-- what this note covers -->/);
  assert.deepEqual(made.left.map((one) => one.rule), ["Schema.Placeholder"]);
});

test("the tool refuses a kind no schema holds, and a path another schema governs", () => {
  const schemas = schemasIn(governedTree({}));
  assert.match(
    mintedNote(schemas, { kind: "stranger", path: "spec/notes/one.md" }).why,
    /holds no stranger/,
  );
  assert.match(
    mintedNote(schemas, { kind: "note", path: "spec/notes/one.txt" }).why,
    /names no markdown file/,
  );
  assert.match(mintedNote(schemas, { kind: "note" }).why, /takes a kind and a path/);
});

test("a note the schema refuses comes back with the finding, and no text", () => {
  const schemas = schemasIn(governedTree({}));
  const made = mintedNote(schemas, {
    kind: "note",
    path: "spec/notes/fresh.md",
    fields: { Scope: "# Stranger\n\nA chapter the schema never names." },
  });
  assert.equal(made.text, undefined);
  assert.match(made.why, /refuses this write/);
  assert.ok(made.found.length);
});

// [[spec/design_output/schema#the-fields-a-caller-names]]
test("the fields read the same off the command line as out of a tool call", () => {
  const handed = fieldsIn(
    ["note", "spec/notes/one.md", "--status=done", "--what-stands-open=Nothing waits."],
    SCHEMA,
  );
  assert.deepEqual(handed.fields, { status: "done", "What stands open": "Nothing waits." });

  const text = mintNote(SCHEMA, handed.fields);
  assert.match(text, /^---\nkind: \[\[note\]\]\nstatus: done\n---/);
  assert.match(text, /# What stands open\n\nNothing waits\.\n/);
});

test("a field the schema never names is refused, and the refusal names what it takes", () => {
  const handed = fieldsIn(["--stranger=a value"], SCHEMA);
  assert.equal(handed.fields, undefined);
  assert.match(handed.why, /stranger names no field of a note note/);
  assert.match(handed.why, /status/);
});

test("mint writes a link and a list in the shape the schema names", () => {
  const text = mintNote(SCHEMA, {
    explains: "spec/guidance/voice",
    scope: ["people", "agents"],
  });
  assert.match(text, /\nexplains: \[\[spec\/guidance\/voice\]\]\n/);
  assert.match(text, /\nscope: \["people", "agents"\]\n/);
  assert.deepEqual(
    checkNote(text, SCHEMA, NOTE).filter((one) =>
      ["Schema.explains", "Schema.scope"].includes(one.rule),
    ),
    [],
  );
});

test("mint keeps the kind the schema names, whatever the fields hand in", () => {
  assert.match(mintNote(SCHEMA, { kind: "other" }), /^---\nkind: \[\[note\]\]\n/);
});

// [[spec/design_output/schema#the-tool-writes-the-note]]
test("the tool spec names every kind the folder holds", () => {
  const spec = mintSpec(schemasIn(governedTree({})));
  assert.equal(spec.name, MINT_TOOL);
  assert.deepEqual(spec.inputSchema.properties.kind.enum, ["note"]);
  assert.deepEqual(spec.inputSchema.required, ["kind", "path"]);
});

// [[spec/design_output/schema#a-folder-names-its-kind]]
test("the refusal names the schema, the finding and mint_note as the road", () => {
  const schemas = schemasIn(governedTree({}));
  const governor = governorOf(schemas, "spec/notes/bare.md");
  const said = refusedKind(
    "spec/notes/bare.md",
    governor,
    strangerFault("# No kind here\n", governor, "spec/notes/bare.md"),
  );
  assert.match(said, /^spec\/schemas\/note\.schema\.yaml governs spec\/notes\/bare\.md/);
  assert.match(said, /Schema\.Kind/);
  assert.match(said, /mint_note/);
  assert.match(said, /_name\.md/);
});
