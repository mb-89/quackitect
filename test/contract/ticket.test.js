// The three schemas level one ships, read off disk and driven through the real
// checker. One fixture per refusal, so a nested fault, a bad path and an orphan
// field each come back with the line they stand on.
// [[spec/design_output/schema#three-keywords-name-a-step]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  allSchemasIn,
  checkData,
  checkNote,
  dataSchemasIn,
  governorOf,
  mintNote,
  refOf,
  schemasIn,
} from "../../.claude/skills/level0/lib/schema.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { disk } from "../../src/doors/disk.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const here = treeOf({
  disk: disk(),
  git: git(proc(), root),
  root,
  words: 5,
  node: "",
});

const schemas = schemasIn(here);
const data = dataSchemasIn(here);
const every = allSchemasIn(here);
const ticket = schemas.get("ticket");
const group = schemas.get("group");
const process = data.get("process");

const TICKET = "spec/tickets/a-name.md";
const weighed = (text, where = TICKET) => checkNote(text, ticket, where, every);
const good = mintNote(ticket);

const routed = `---
kind: [[ticket]]
state: open
urgency: now
step: implement/change
steps:
  - name: design
    steps:
      - name: draft
        does: writes the design input the ask calls for
      - name: review
        does: reads the design input against the ask
        by: not draft
        on_fail: draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    steps:
      - name: change
        does: makes the change
        input: design/draft
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
---

# Ask

What this ticket asks for.

# design

## draft

## review

### verdict

# implement

## change

### lint

# Discussion

Nothing yet.
`;

// [[spec/design_output/schema#a-schema-names-its-chapters]]
test("the ticket and the group read as note schemas, and the process reads as data", () => {
  assert.ok(ticket, "spec/schemas holds a ticket schema");
  assert.ok(group, "spec/schemas holds a group schema");
  assert.ok(process, "spec/schemas holds a process schema");
  assert.equal(
    schemas.has("process"),
    false,
    "a data schema reaches the note reader nowhere",
  );
  assert.equal(
    data.has("ticket"),
    false,
    "a note schema reaches the data reader nowhere",
  );
});

// [[spec/design_output/schema#one-home-for-a-shape]]
test("the route stands in one place, and the group and the process name it", () => {
  const home = ticket.frontmatter.properties.steps;
  assert.ok(
    home.items?.properties?.evidence,
    "the ticket schema holds the route's fields",
  );
  for (const [kind, said] of [
    ["group", group.frontmatter.properties.steps],
    ["process", process.data.properties.steps],
  ]) {
    assert.equal(
      said.$ref,
      "ticket#/frontmatter/properties/steps",
      `${kind} names the route the ticket holds`,
    );
    assert.deepEqual(
      Object.keys(refOf(said.$ref, null, every).items.properties).sort(),
      Object.keys(home.items.properties).sort(),
      `${kind} reads the same fields`,
    );
  }
});

// [[spec/design_output/schema#a-folder-names-its-kind]]
test("both ticket folders stand under one schema, and the private one travels nowhere", () => {
  assert.equal(governorOf(schemas, TICKET)?.kind, "ticket");
  assert.equal(governorOf(schemas, ".se/tickets/a-name.md")?.kind, "ticket");
  assert.equal(governorOf(schemas, "spec/groups/a-name.md")?.kind, "group");
  assert.equal(governorOf(data, "spec/processes/standard.yaml")?.kind, "process");
});

// [[spec/design_output/schema#mint-writes-a-valid-note]]
test("mint writes a ticket the checker passes, in either folder", () => {
  assert.deepEqual(weighed(good), []);
  assert.deepEqual(weighed(good, ".se/tickets/a-name.md"), []);
  assert.deepEqual(
    checkNote(mintNote(group), group, "spec/groups/a-name.md", every),
    [],
  );
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("a ticket carrying a whole route breaks no rule", () => {
  assert.deepEqual(weighed(routed), []);
});

// [[spec/design_output/schema#the-checker-walks-every-key]]
test("a fault nested two lists deep names the line it stands on", () => {
  const one = weighed(
    routed.replace(
      "            expects: 0",
      "            expects: 0\n            about: a thing",
    ),
  )[0];
  assert.equal(one.rule, "Schema.about");
  assert.equal(one.line, 28);
  assert.match(
    one.message,
    /names no about under steps\[1\]\.steps\[0\]\.evidence\[0\]/,
  );
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a path naming no step of this route is refused, with the steps it holds", () => {
  const one = weighed(
    routed.replace("step: implement/change", "step: implement/ship"),
  )[0];
  assert.equal(one.rule, "Schema.step");
  assert.equal(one.line, 5);
  assert.match(one.message, /implement\/change/);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("an orphan field on a step is refused, and the render's chapter with it", () => {
  const bad = weighed(
    routed.replace("        does: makes the change", "        writes: a thing"),
  );
  assert.deepEqual(
    bad.map((one) => one.rule),
    ["Schema.writes"],
  );
  assert.equal(bad[0].line, 22);
});

// [[spec/design_output/schema#three-keywords-name-a-step]]
test("a chapter missing for an evidence field is refused", () => {
  const bad = weighed(routed.replace("### lint\n", ""));
  assert.deepEqual(
    bad.map((one) => one.rule),
    ["Schema.lint"],
  );
});

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
test("a process file reads under the process schema, and a stray key is refused", () => {
  const where = "spec/processes/standard.yaml";
  const text = "steps:\n  - name: do\n    does: makes the change the ask names\n";
  assert.deepEqual(checkData(text, process, where, every), []);

  const bad = checkData(`${text}about: a thing\n`, process, where, every);
  assert.deepEqual(
    bad.map((one) => one.rule),
    ["Schema.about"],
  );
  assert.equal(bad[0].line, 4);
});

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
test("every process file this tree ships stands under the process schema", () => {
  for (const path of here.paths()) {
    if (!path.startsWith("spec/processes/") || !path.endsWith(".yaml")) continue;
    assert.deepEqual(checkData(here.read(path), process, path, every), [], path);
  }
});
