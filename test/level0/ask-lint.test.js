// The voice rules over an Ask at the open, driven through the ticket verb with
// a fake Vale: a broken Ask stands draft, a clean one opens, and a box with no
// Vale opens as it stands.
// [[spec/design_output/pull#a-draft-opens]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { askFaults } from "../../src/scripts/ticket-ask-lint.js";
import { askLines, ticket } from "../../src/scripts/ticket.js";
import { semicolonVale } from "./semicolon-vale.js";

const ROOT = "/tree";
const VALE = "/tree/.se/.runtime/bin/vale";
const AT = "spec/tickets/a-thing.md";
const at = (path) => join(ROOT, ...path.split("/"));
// The Ask's own line in DRAFT, and a line under the do chapter past it, as the lint names them. [[spec/design_output/pull#a-draft-opens]]
const ASK_LINE = 10;
const DO_LINE = 14;

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
      Line: ASK_LINE,
      Span: [17, 17],
      Message: "The character < stands outside the set a paragraph admits.",
      Severity: "error",
    },
  ],
});

function box(said) {
  // The open reads through the lint's Vale call, on the config the assembly writes, and names the path last. [[spec/design_output/pull#a-draft-opens]]
  const line = `${VALE} --config=.vale.ini --output=JSON --no-exit --path=${AT}`;
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(AT)]: DRAFT,
  });
  const git = fakeGit(
    { [line]: typeof said === "function" ? said : { stdout: said } },
    ROOT,
  );
  const proc = git.proc;
  return {
    it: { disk, proc, git, root: ROOT, join, words: 5, vale: VALE },
    disk,
    proc,
  };
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
  assert.match(ran.said, new RegExp(`line ${ASK_LINE} breaks Characters`));
  assert.match(ran.said, /Rewrite the Ask, then open it again\./);
  assert.match(disk.read(at(AT)), /^state: draft$/m, "the draft stands");
});

const GROUP_DRAFT = DRAFT.replace(
  "state: draft\n",
  "state: draft\nprocess: [[spec/processes/group]]\n",
);
const CHILD =
  "---\nkind: [[ticket]]\nstate: draft\ngroup: a-thing\n---\n\n# Ask\n\nA part.\n";

// [[spec/design_output/work#a-group-is-a-ticket]]
test("a group no ticket names refuses the open, and the draft stands", () => {
  const { it, disk } = box("{}");
  disk.write(at(AT), GROUP_DRAFT);
  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));
  assert.equal(ran.code, 1);
  assert.match(ran.said, /no ticket names it under group/);
  assert.match(disk.read(at(AT)), /^state: draft$/m, "the draft stands");
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("a group with a child standing opens", () => {
  const { it, disk } = box("{}");
  disk.write(at(AT), GROUP_DRAFT);
  disk.write(at("spec/tickets/a-part.md"), CHILD);
  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));
  assert.equal(ran.code, 0, ran.said);
  assert.match(disk.read(at(AT)), /^state: open$/m);
});

test("an Ask that passes opens the ticket at its first leaf", () => {
  const { it, disk } = box("{}");
  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));
  assert.equal(ran.code, 0);
  assert.match(disk.read(at(AT)), /^state: open$/m);
  assert.match(ran.said, /stands open at do/);
});

// The open reads at the lint's level, so a warning on the Ask refuses as an error does. [[spec/design_output/pull#a-draft-opens]]
test("a warning on the Ask refuses the open, a warning past the Ask leaves it alone, and a box with no Vale opens as it stands", () => {
  const warnedAt = (line) =>
    JSON.stringify({
      "stdin.md": [
        {
          Check: "VoiceParagraph.Wordy",
          Line: line,
          Severity: "warning",
          Message: "Wordy.",
        },
      ],
    });
  const onAsk = heard(() =>
    ticket(ROOT, ["open", "a-thing"], box(warnedAt(ASK_LINE)).it),
  );
  assert.equal(onAsk.code, 1, onAsk.said);
  assert.match(onAsk.said, new RegExp(`line ${ASK_LINE} breaks Wordy`));
  const past = heard(() =>
    ticket(ROOT, ["open", "a-thing"], box(warnedAt(DO_LINE)).it),
  );
  assert.equal(past.code, 0, past.said);
  const bare = box("{}");
  assert.deepEqual(askFaults({ ...bare.it, vale: "" }, AT, DRAFT), []);
  assert.equal(bare.proc.ran.length, 0, "no Vale, no run");
});

// [[spec/design_output/pull#a-draft-opens]]
test("ticket open over an Ask carrying a semicolon refuses, naming Characters at the file's line, and the draft stands", () => {
  const ran = [];
  const { it, disk } = box(semicolonVale(ran));
  const text = DRAFT.replace("<upstream>", "the upstream; and more");
  disk.write(at(AT), text);

  const said = heard(() => ticket(ROOT, ["open", "a-thing"], it));

  assert.equal(said.code, 1, said.said);
  assert.match(said.said, new RegExp(`line ${ASK_LINE} breaks Characters`));
  assert.match(disk.read(at(AT)), /^state: draft$/m, "the draft stands");
  assert.equal(ran[0]?.stdin, text, "Vale reads the whole ticket");
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

// The open lands the ticket it opens in one commit, so the open reaches the queue with the push. [[spec/design_output/pull#a-draft-opens]]
test("an open commits the ticket it opens, and names it", () => {
  const git = fakeGit({}, ROOT);
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(AT)]: DRAFT.replace("<upstream>", "the upstream"),
  });
  const it = { disk, proc: git.proc, git, root: ROOT, join, words: 5, vale: "" };

  const ran = heard(() => ticket(ROOT, ["open", "a-thing"], it));

  assert.equal(ran.code, 0, ran.said);
  const commits = git.ran
    .map((one) => one.argv.join(" "))
    .filter((one) => one.startsWith("git commit"));
  assert.equal(commits.length, 1, "one commit lands");
  assert.match(commits[0], /a-thing/, "the commit names the ticket");
});
