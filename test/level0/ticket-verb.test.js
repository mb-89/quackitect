// The ticket verb, driven through a fake disk. note and update reach the disk
// through arguments, so every case here runs in memory.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import {
  fromHold,
  HOLD,
  NOTE,
  NOTES,
  ticket,
  updated,
} from "../../src/scripts/ticket.js";
import { semicolonVale } from "./semicolon-vale.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

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

const NOTE_PROCESS = `for: a thing to look at later
ask:
  - name: line
    form: text
    says: the smallest case that shows it
steps:
  - name: decide
    does: says what the note becomes
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: text
        says: what the note becomes
`;

const TRIVIAL_PROCESS = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes and why
`;

// [[spec/design_output/doors#a-fake-behaves]]
const TICKET_SCHEMA = `kind: ticket

governs:
  - .se/tickets/**

frontmatter:
  type: object
  additionalProperties: false
  required: [kind, state, urgency, steps]
  properties:
    kind:
      const: ticket
      x-link: true
      description: the schema this note is minted from
    state:
      enum: [draft, open, closed]
      description: whether anybody pulls it
    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first
    todo:
      type: boolean
      description: whether a hand parks this note here
    group:
      type: string
      description: the branch this ticket lands on
    step:
      type: string
      x-names: steps
      x-leaf: true
      description: the leaf of the route this ticket stands on
    steps:
      type: array
      description: the route, as a tree of steps
      items:
        type: object
        additionalProperties: false
        required: [name]
        properties:
          name:
            type: string
            description: one word, unique among its siblings
          steps:
            $ref: "#/frontmatter/properties/steps"
            description: the steps under this phase
          does:
            type: string
            description: what the hand does at this leaf
          by:
            type: string
            description: the hand this step admits
          from:
            type: string
            description: who hands this step its input
          to:
            type: string
            description: who takes the output
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          evidence:
            type: array
            description: the fields this leaf's hand fills
            items:
              type: object
              additionalProperties: false
              required: [name, form, says]
              properties:
                name:
                  type: string
                  description: one word
                form:
                  enum: [text, command]
                  description: what the hand writes
                says:
                  type: string
                  description: one line on what goes here
    process:
      x-link: true
      description: the route the mint copies from
    process_hash:
      type: string
      description: the hash of the process file the route is copied from

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Ask
      required: true
      description: what this ticket asks for
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
      description: what anybody adds, at any time
`;

function treeWithProcesses(files = {}) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at("spec/processes/note.yaml")]: NOTE_PROCESS,
    [at("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    ...files,
  });
  return { it: { disk, join, words: 5 }, disk };
}

test("ticket note writes a private ticket off the note process, and says so", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "The", "lint", "drags."], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^kind: \[\[ticket\]\]$/m);
  assert.match(text, /^state: open$/m);
  assert.match(text, /^step: decide$/m);
  assert.match(text, /^process: \[\[spec\/processes\/note\]\]$/m);
  assert.match(text, /^process_hash: [0-9a-f]{16}$/m);
  assert.match(text, /The lint drags\./);
  assert.match(ran.said, /waits for a retro to decide it/);
});

// A note asking for a discussion waits for a person, so the pull hands it to no agent at a desk. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
test("ticket note --talk marks the decide step a person's, and the line loses the flag", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "--talk", "The", "lint", "drags."], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^ {4}by: person$/m);
  assert.match(text, /The lint drags\.$/m);
  assert.doesNotMatch(text, /--talk/);
  assert.match(ran.said, /waits for a person to decide it/);
});

test("ticket note writes a note row, so the answer door reads it off the log", () => {
  const rows = [];
  const said = treeWithProcesses();
  said.it.log = {
    say: (level, kind, line, more) => {
      rows.push({ level, kind, line, more });
      return Promise.resolve();
    },
  };
  ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it);
  assert.deepEqual(rows, [
    {
      level: "info",
      kind: NOTE,
      line: "The lint drags.",
      more: { text: "The lint drags.", ticket: "slow-lint" },
    },
  ]);
});

// The row holds one sentence under `said`, and the details read `text`. [[spec/design_output/log#what-a-box-writes]]
test("a note past the row's width carries its whole line under text", () => {
  const rows = [];
  const said = treeWithProcesses();
  said.it.log = {
    say: (_level, _kind, line, more) => {
      rows.push({ line, more });
      return Promise.resolve();
    },
  };
  const long = `The lint drags, ${"and it drags on ".repeat(8)}so the row clips it.`;
  ticket(ROOT, ["note", "slow-lint", long], said.it);

  assert.ok(long.length > 80, "the line runs past the width a row holds");
  assert.equal(rows[0].more.text, long, "text carries the line whole");
  assert.equal(
    rows[0].line,
    long,
    "the door reads the whole line, and clips its own row",
  );
});

test("ticket note writes from off the hold, as the ticket and the step in hand", () => {
  const said = treeWithProcesses({
    [at(HOLD)]: JSON.stringify({
      ticket: "a-route-is-a-graph",
      step: "implement/change",
    }),
  });
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  assert.match(
    said.disk.read(at(`${NOTES}/slow-lint.md`)),
    /^ {4}from: a-route-is-a-graph\/implement\/change$/m,
  );
});

test("ticket note takes a name and a line, and refuses a note standing already", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["note", "slow-lint"], said.it)).code, 2);
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const twice = heard(() => ticket(ROOT, ["note", "slow-lint", "Again."], said.it));
  assert.equal(twice.code, 2);
  assert.match(twice.said, /stands already/);
});

// The note reads its minted text through the lint's road, and a break of form warns while the note lands. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("ticket note writes a line the lint warns on, and names Characters at its line", () => {
  const VALE = "/tree/.se/.runtime/bin/vale";
  const ran = [];
  const said = treeWithProcesses();
  const proc = fakeProc();
  proc.teach([VALE], semicolonVale(ran));
  const it = { ...said.it, proc, root: ROOT, vale: VALE };

  const warned = heard(() => ticket(ROOT, ["note", "a-name", "one; two"], it));

  assert.equal(warned.code, 0, warned.said);
  assert.match(warned.said, /breaks a rule of form, and it lands/);
  const line =
    String(ran[0]?.stdin ?? "")
      .split("\n")
      .indexOf("one; two") + 1;
  assert.ok(line > 0, "Vale reads the minted ticket whole");
  assert.match(warned.said, new RegExp(`line ${line} breaks Characters`));
  assert.equal(said.disk.exists(at(`${NOTES}/a-name.md`)), true, "the note stands");
});

test("ticket update refuses where step names a leaf the new route lacks", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: decide\nsteps:\n  - name: decide\n    does: says what the note becomes\n    to: retro\nprocess: [[spec/processes/note]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# decide\n\n<!-- says what the note becomes -->\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${NOTES}/slow-lint.md`)]: front });
  const ran = heard(() =>
    ticket(ROOT, ["update", "slow-lint", "--process=trivial", "--over"], said.it),
  );
  assert.equal(ran.code, 1);
  assert.match(ran.said, /holds no such leaf/);
});

test("ticket update copies the current route, and keeps the leaves already reached", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: do\nsteps:\n  - name: do\n    does: makes the change, the old way\n    to: retro\n    evidence:\n      - name: says\n        form: text\n        says: what changes and why\nprocess: [[spec/processes/trivial]]\nprocess_hash: old\n---\n\n# Ask\n\nA thing.\n\n# do\n\n<!-- makes the change, the old way -->\n\n## says\n\nIt changes the lint.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at(`${NOTES}/slow-lint.md`)]: front });
  const ran = heard(() => ticket(ROOT, ["update", "slow-lint", "--over"], said.it));

  assert.equal(ran.code, 0);
  const now = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(
    now,
    /makes the change, the old way/,
    "the leaf in hand keeps what it holds",
  );
  assert.match(now, /It changes the lint\./, "the chapter keeps what the hand wrote");
  assert.match(now, /^process_hash: [0-9a-f]{16}$/m);
});

test("ticket update leaves a ticket whose hash already matches its process", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  const was = said.disk.read(at(`${NOTES}/slow-lint.md`));
  const ran = heard(() => ticket(ROOT, ["update", "slow-lint"], said.it));

  assert.equal(ran.code, 0);
  assert.match(ran.said, /already carries note as it stands/);
  assert.equal(said.disk.read(at(`${NOTES}/slow-lint.md`)), was);
});

test("ticket update names no ticket, and a ticket standing nowhere, and refuses", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["update"], said.it)).code, 2);
  assert.equal(heard(() => ticket(ROOT, ["update", "nowhere"], said.it)).code, 2);
});

test("updated takes the new leaf where the ticket has yet to reach it", () => {
  const front = {
    step: "one",
    steps: [
      { name: "one", does: "the old first" },
      { name: "two", does: "the old second" },
    ],
  };
  const route = [
    { name: "one", does: "the new first" },
    { name: "two", does: "the new second" },
  ];
  const said = updated(front, route);
  assert.equal(said.kept, 1);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the new second");
});

test("a leaf the record holds keeps what it holds, wherever the pointer stands", () => {
  const front = {
    step: "two",
    record: [{ step: "one" }],
    steps: [
      { name: "one", does: "the old first" },
      { name: "two", does: "the old second" },
      { name: "three", does: "the old third" },
    ],
  };
  const said = updated(front, [
    { name: "one", does: "the new first" },
    { name: "two", does: "the new second" },
    { name: "three", does: "the new third" },
  ]);
  assert.equal(said.steps[0].does, "the old first");
  assert.equal(said.steps[1].does, "the old second");
  assert.equal(said.steps[2].does, "the new third");
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket note takes the todo flag, writes the field, and keeps the line clean", () => {
  const said = treeWithProcesses();
  const ran = heard(() =>
    ticket(ROOT, ["note", "slow-lint", "The", "lint", "drags.", "--todo"], said.it),
  );

  assert.equal(ran.code, 0);
  const text = said.disk.read(at(`${NOTES}/slow-lint.md`));
  assert.match(text, /^todo: true$/m);
  assert.match(text, /The lint drags\./);
  assert.doesNotMatch(text, /--todo/);
  assert.match(ran.said, /hands it back first/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a note minted without the flag carries no todo, and reads false", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));
  assert.doesNotMatch(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo tags a ticket standing already, and --off takes the tag away", () => {
  const said = treeWithProcesses();
  heard(() => ticket(ROOT, ["note", "slow-lint", "The lint drags."], said.it));

  const on = heard(() => ticket(ROOT, ["todo", "slow-lint"], said.it));
  assert.equal(on.code, 0);
  assert.match(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo: true$/m);
  assert.match(on.said, /hands it back first/);

  const off = heard(() => ticket(ROOT, ["todo", "slow-lint", "--off"], said.it));
  assert.equal(off.code, 0);
  assert.doesNotMatch(said.disk.read(at(`${NOTES}/slow-lint.md`)), /^todo:/m);
  assert.match(off.said, /carries no todo/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo reaches a tracked ticket too, because the tag reaches any folder", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing"], said.it));

  assert.equal(ran.code, 0);
  assert.match(said.disk.read(at("spec/tickets/a-thing.md")), /^todo: true$/m);
});

// [[spec/design_output/pull#the-private-queue]]
test("a closed note steps aside for the tracked ticket of its name, and an open one stands first", () => {
  const front = (state) =>
    `---\nkind: [[ticket]]\nstate: ${state}\nurgency: soon\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const shadowed = treeWithProcesses({
    [at(".se/tickets/a-thing.md")]: front("closed"),
    [at("spec/tickets/a-thing.md")]: front("open"),
  });
  heard(() => ticket(ROOT, ["todo", "a-thing"], shadowed.it));
  assert.match(
    shadowed.disk.read(at("spec/tickets/a-thing.md")),
    /^todo: true$/m,
    "the ticket takes the tag",
  );
  assert.ok(
    !/^todo: true$/m.test(shadowed.disk.read(at(".se/tickets/a-thing.md"))),
    "the closed note takes none",
  );

  const live = treeWithProcesses({
    [at(".se/tickets/a-thing.md")]: front("open"),
    [at("spec/tickets/a-thing.md")]: front("open"),
  });
  heard(() => ticket(ROOT, ["todo", "a-thing"], live.it));
  assert.match(
    live.disk.read(at(".se/tickets/a-thing.md")),
    /^todo: true$/m,
    "an open note stands first",
  );
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("a ticket riding a branch takes no tag, and the refusal names the branch", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\ngroup: the-flag-parks-work\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing"], said.it));

  assert.equal(ran.code, 2);
  assert.match(ran.said, /rides the-flag-parks-work/);
  assert.doesNotMatch(said.disk.read(at("spec/tickets/a-thing.md")), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("--off reaches a ticket riding a branch, so a tag never sticks", () => {
  const front = `---\nkind: [[ticket]]\nstate: open\nurgency: soon\ntodo: true\ngroup: the-flag-parks-work\nsteps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n`;
  const said = treeWithProcesses({ [at("spec/tickets/a-thing.md")]: front });
  const ran = heard(() => ticket(ROOT, ["todo", "a-thing", "--off"], said.it));

  assert.equal(ran.code, 0);
  assert.doesNotMatch(said.disk.read(at("spec/tickets/a-thing.md")), /^todo:/m);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("ticket todo takes a ticket, and names no ticket it fails to find", () => {
  const said = treeWithProcesses();
  assert.equal(heard(() => ticket(ROOT, ["todo"], said.it)).code, 2);
  const missing = heard(() => ticket(ROOT, ["todo", "nothing-here"], said.it));
  assert.equal(missing.code, 2);
  assert.match(missing.said, /names no ticket/);
});

test("a hold names the from of every leaf, and a phase keeps its own", () => {
  const route = [{ name: "one" }, { name: "up", steps: [{ name: "deep" }] }];
  const said = fromHold(route, { ticket: "a-ticket", step: "one" });
  assert.equal(said[0].from, "a-ticket/one");
  assert.equal(said[1].from, undefined);
  assert.deepEqual(fromHold(route, null), route);
});
