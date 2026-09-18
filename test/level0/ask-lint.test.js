// The voice rules over an Ask at the open, driven through the ticket verb with
// a fake Vale: a broken Ask stands draft, a clean one opens, and a box with no
// Vale opens as it stands.
// [[spec/design_output/pull#a-draft-opens]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { askFaults } from "../../src/scripts/ask-lint.js";
import { askLines, ticket } from "../../src/scripts/ticket.js";

const ROOT = "/tree";
const VALE = "/tree/.se/run/bin/vale";
const AT = "spec/tickets/a-thing.md";
const at = (path) => join(ROOT, ...path.split("/"));

const SCHEMA = `kind: ticket

governs:
  - spec/tickets/**

frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
      description: the schema this note is minted from
    state:
      enum: [draft, open, closed]
      description: whether anybody pulls it
    step:
      type: string
      description: the leaf this ticket stands on
    steps:
      type: array
      description: the route

body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
      description: what this ticket asks for
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
      description: what anybody adds
`;

const DRAFT = `---
kind: [[ticket]]
state: draft
steps:
  - name: do
---

# Ask

The verb clones <upstream> into the folder.

# do

Nothing yet.

# Discussion

Nothing yet.
`;

const FOUND = JSON.stringify({
  "stdin.md": [
    {
      Check: "VoiceParagraph.Characters",
      Line: 1,
      Span: [17, 17],
      Message: "The character < stands outside the set a paragraph admits.",
      Severity: "error",
    },
  ],
});

function box(said) {
  const line = `${VALE} --config=.vale.ini --path=${AT} --output=JSON --no-exit`;
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(AT)]: DRAFT,
  });
  const proc = fakeProc({ [line]: { stdout: said } });
  return { it: { disk, proc, root: ROOT, join, words: 5, vale: VALE }, disk, proc };
}

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

test("an Ask breaking a rule refuses the open, names the rule and leaves the draft", () => {
  const { it, disk } = box(FOUND);
  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));
  assert.equal(ran.code, 1);
  assert.match(ran.said, /breaks the voice rules/);
  assert.match(ran.said, /line 1 breaks Characters/);
  assert.match(ran.said, /Rewrite the Ask, then open it again\./);
  assert.match(disk.read(at(AT)), /^state: draft$/m, "the draft stands");
});

test("an Ask that passes opens the ticket at its first leaf", () => {
  const { it, disk } = box("{}");
  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));
  assert.equal(ran.code, 0);
  assert.match(disk.read(at(AT)), /^state: open$/m);
  assert.match(ran.said, /stands open at do/);
});

test("a warning leaves the open alone, and a box with no Vale opens as it stands", () => {
  const warned = JSON.stringify({
    "stdin.md": [
      {
        Check: "VoiceParagraph.Wordy",
        Line: 1,
        Severity: "warning",
        Message: "Wordy.",
      },
    ],
  });
  assert.equal(heard(() => ticket(ROOT, ["open", "a-thing"], box(warned).it)).code, 0);
  const bare = box("{}");
  assert.deepEqual(askFaults({ ...bare.it, vale: "" }, AT, ["a line"]), []);
  assert.equal(bare.proc.ran.length, 0, "no Vale, no run");
});

// [[spec/design_output/pull#a-draft-opens]]
test("the ask rows keep every blank line, and drop the placeholder comments", () => {
  const own = [
    "",
    "A row carries one key a flag.",
    "",
    "<!-- gain, as text: what is gained -->",
    "| the letter | the key |",
    "|---|---|",
    "| U | urgent |",
    "",
    "The keys stay ordinary keys.",
  ];
  assert.deepEqual(askLines({ own }), [
    "",
    "A row carries one key a flag.",
    "",
    "| the letter | the key |",
    "|---|---|",
    "| U | urgent |",
    "",
    "The keys stay ordinary keys.",
  ]);
});

test("an ask of blanks alone holds nothing, and one line makes it hold", () => {
  const holds = (own) => askLines({ own }).some((row) => row.trim());
  assert.equal(holds(["", "  ", ""]), false);
  assert.equal(holds(["", "<!-- gain -->", ""]), false);
  assert.equal(holds(["", "A thing.", ""]), true);
});
