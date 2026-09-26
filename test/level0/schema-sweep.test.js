// The schema reader and the note checker: the sweep over a tree, and the folders a schema governs.
// A sweep reads every note beside every schema, so a case here builds a tree and
// reads what comes back.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkNote,
  governorOf,
  MINT_TOOL,
  placeholderFaults,
  refusedKind,
  schemaFaults,
  schemasIn,
  strangerFault,
} from "../../.claude/skills/level0/lib/schema.js";
import {
  fieldsIn,
  mintedNote,
  mintNote,
  mintSpec,
} from "../../.claude/skills/level0/lib/schema-mint.js";
import { GOVERNED, governedTree, NOTE, SCHEMA, treeWith } from "./schema-notes.js";

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

test("a schema answers which paths it governs, and a path outside reaches none", () => {
  const schemas = schemasIn(governedTree({}));
  assert.equal(governorOf(schemas, "spec/notes/one.md")?.kind, "note");
  assert.equal(governorOf(schemas, "spec/notes/deep/one.md")?.kind, "note");
  assert.equal(governorOf(schemas, "README.md"), null);
});

test("a schema describing no note reaches the reader nowhere", () => {
  const tree = treeWith({
    "spec/schemas/note.schema.yaml": GOVERNED,
    "spec/schemas/paragraph.schema.yaml":
      "kind: paragraph\n\nlayers:\n  shape:\n    sentencesPerParagraph: 6\n",
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
  assert.match(
    said[0].message,
    /reads as a other, and the note schema governs this path/,
  );
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
    governedTree({
      "spec/notes/fresh.md":
        "---\nkind: [[note]]\n---\n\n# Scope\n\n<!-- what this note covers -->\n",
    }),
  );
  assert.deepEqual(
    said.map((one) => one.rule),
    ["Schema.Placeholder"],
  );
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
  assert.deepEqual(
    made.left.map((one) => one.rule),
    ["Schema.Placeholder"],
  );
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
  assert.deepEqual(handed.fields, {
    status: "done",
    "What stands open": "Nothing waits.",
  });

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
  assert.match(
    said,
    /^spec\/schemas\/note\.schema\.yaml governs spec\/notes\/bare\.md/,
  );
  assert.match(said, /Schema\.Kind/);
  assert.match(said, /mint_note/);
  assert.match(said, /_name\.md/);
});

// [[spec/tickets/each-folder-holds-its-kind]]
test("a page under a note folder draws a warning, and a note beside it draws none of it", () => {
  const said = schemaFaults(
    governedTree({
      "spec/notes/page.html": "<html></html>\n",
      "spec/notes/good.md": "---\nkind: [[note]]\n---\n\n# Scope\n\nWhat it covers.\n",
    }),
  );
  const rows = said.filter((one) => one.rule === "Schema.Folder");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].file, "spec/notes/page.html");
  assert.equal(rows[0].severity, "warning");
  assert.match(rows[0].message, /spec\/notes\/page\.html .*note/);
});
