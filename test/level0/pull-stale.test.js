// The stale read, driven through the pull over the fake doors in pull-doors.js:
// what a pass records, what a moved input marks, and what a process edit moves.
// [[spec/design_output/pull#an-input-marks-its-steps]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { hashText } from "../../.claude/skills/level0/lib/hash.js";
import { fakeIndex } from "../../src/doors/fake/index.js";
import { fieldOf, frontOf, recordIn, withEntry } from "../../src/engine/group.js";
import { processHash } from "../../.claude/skills/level0/lib/schema-route.js";
import { defOf, inputsOf } from "../../src/scripts/pull-stale.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { pulling } from "../../src/scripts/work.js";
import { offer } from "../../src/scripts/pull-hand.js";
import { passed } from "../../src/scripts/pull-writes.js";
import { at, doors, heard, ROOT, SHA, standing } from "./pull-doors.js";

const TICKET = at("spec/tickets/a-child.md");
const PROCESS = at("spec/processes/staged.yaml");
const NOTE = at("spec/design_output/one.md");

const ROUTE = (review = "reads the approach", tests = "runs the tests") => `steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: review
        does: ${review}
        input: design/draft
        evidence:
          - name: says
            form: text
            says: what the review finds
  - name: implement
    steps:
      - name: change
        does: makes the change
        input: [ask, design/review]
        evidence:
          - name: says
            form: text
            says: what changes
      - name: tests
        does: ${tests}
        input: implement/change
        to: retro
        evidence:
          - name: says
            form: text
            says: what the tests say
`;

const BODY = `# Ask

One piece of it.

# design

## draft

### approach

The approach. For details, see [[spec/design_output/one]].

## review

### says

It reads well.

# implement

## change

### says

The change.

## tests

### says

# Discussion
`;

const NOTE_TEXT = "---\nkind: [[design_output]]\n---\n\n# One\n\nThe design.\n";

// The ticket at a step, on the staged process where `hash` names one. [[spec/design_output/pull#an-input-marks-its-steps]]
const CHILD = (step, hash = "") => `---
kind: [[ticket]]
state: open
urgency: now
step: ${step}
${ROUTE()}${hash ? `process: [[staged]]\nprocess_hash: ${hash}\n` : ""}group: one-group
---

${BODY}`;

// The doors over the ticket, with an index over the same fake disk. [[spec/design_output/pull#an-input-marks-its-steps]]
function made(child, files = {}) {
  const built = doors(
    standing(child, undefined, {
      [PROCESS]: `for: a route in two phases\n${ROUTE()}`,
      [NOTE]: NOTE_TEXT,
      ...files,
    }),
    {},
    { words: 5 },
  );
  built.it.index = fakeIndex(built.disk, ROOT, built.it.join);
  built.it.root = ROOT;
  return built;
}

const textOf = (built) => built.disk.read(TICKET);
const entryOf = (text, step) =>
  recordIn(text)
    .filter((one) => String(one.step) === step)
    .at(-1);

// Each leaf before `upTo` passed, its record carrying the hashes it read. [[spec/design_output/pull#an-input-marks-its-steps]]
function passedUpTo(built, upTo) {
  let text = textOf(built);
  for (const path of ["design/draft", "design/review", "implement/change"]) {
    if (path === upTo) break;
    const leaf = leafOf(frontOf(text), path);
    text = withEntry(
      text,
      {
        step: path,
        hand: "box d462e994b4cef",
        hash_before: SHA,
        hash_after: SHA,
        inputs: inputsOf(built.it, text, leaf),
        def: defOf(built.it, text, leaf),
      },
      built.it.front,
    );
  }
  built.disk.write(TICKET, text);
  return text;
}

const pull = (built) => heard(() => pulling(ROOT, ["pull", "a-child"], built.it));

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a passed leaf records the hash of each input and of its definition", () => {
  const built = made(CHILD("design/review"));
  passedUpTo(built, "design/review");
  pull(built);
  const back = heard(() =>
    pulling(
      ROOT,
      [
        "pull",
        "a-child",
        "--pass",
        "--fields",
        JSON.stringify({ says: "It reads well." }),
      ],
      built.it,
    ),
  );

  assert.equal(back.code, 0, back.said);
  const entry = entryOf(textOf(built), "design/review");
  const names = [entry.inputs ?? []].flat().map((one) => one.name);
  assert.ok(names.includes("design/draft"), JSON.stringify(entry));
  for (const one of [entry.inputs ?? []].flat()) {
    assert.match(String(one.hash), /^[0-9a-f]{16}$/, "each input carries its hash");
    assert.ok(Number(one.size) > 0, "each input carries the size its hash reads");
  }
  assert.match(
    String(entry.def ?? ""),
    /^[0-9a-f]{16}$/,
    "the entry carries its definition's hash",
  );
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a note an input chapter links takes its hash from the index", () => {
  const built = made(CHILD("design/review"));
  const text = textOf(built);
  const inputs = inputsOf(built.it, text, leafOf(frontOf(text), "design/review"));
  const note = inputs.find((one) => one.name === "[[spec/design_output/one]]");

  assert.ok(note, JSON.stringify(inputs));
  assert.equal(note.hash, hashText(NOTE_TEXT));
  assert.equal(note.size, NOTE_TEXT.length);
  assert.ok(
    built.it.index.asked.some((one) => one.method === "hashes"),
    "the engine asks the index",
  );
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a moved input marks exactly the leaves reading it, and the first takes the step", () => {
  const built = made(CHILD("implement/tests"));
  passedUpTo(built, "implement/tests");
  built.disk.write(TICKET, textOf(built).replace("The approach.", "Another approach."));
  pull(built);

  const text = textOf(built);
  assert.equal(
    fieldOf(text, "step"),
    "design/review",
    "the first stale leaf takes the step",
  );
  assert.match(String(entryOf(text, "design/review").stale ?? ""), /design\/draft/);
  for (const whole of ["design/draft", "implement/change"]) {
    assert.equal(
      entryOf(text, whole).stale,
      undefined,
      `${whole} reads no moved input`,
    );
  }
});

const SIBLING = at("spec/tickets/a-sibling.md");
const LINKED = (sibling) =>
  made(
    CHILD("implement/tests").replace(
      "One piece of it.",
      "One piece of it, beside [[spec/tickets/a-sibling]].",
    ),
    { [SIBLING]: sibling },
  );

// [[spec/design_output/pull#ticket-links-read-the-ask]]
test("a linked ticket whose front and chapters move keeps the leaves reading it whole", () => {
  const built = LINKED(CHILD("design/review"));
  passedUpTo(built, "implement/tests");
  built.disk.write(
    SIBLING,
    CHILD("implement/change").replace("It reads well.", "It reads better."),
  );
  pull(built);

  const text = textOf(built);
  assert.equal(fieldOf(text, "step"), "implement/tests");
  assert.ok(!recordIn(text).some((one) => one.stale), "no leaf stands stale");
});

// [[spec/design_output/pull#ticket-links-read-the-ask]]
test("a linked ticket whose Ask moves marks the leaves reading it", () => {
  const built = LINKED(CHILD("design/review"));
  passedUpTo(built, "implement/tests");
  built.disk.write(
    SIBLING,
    CHILD("design/review").replace("One piece of it.", "Another piece."),
  );
  pull(built);

  const text = textOf(built);
  assert.equal(fieldOf(text, "step"), "design/draft");
  assert.match(
    String(entryOf(text, "design/draft").stale ?? ""),
    /spec\/tickets\/a-sibling/,
  );
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("an append to an input keeps the leaves reading it whole", () => {
  const built = made(CHILD("implement/tests"));
  passedUpTo(built, "implement/tests");
  built.disk.write(NOTE, `${NOTE_TEXT}\nA line more.\n`);
  pull(built);

  const text = textOf(built);
  assert.equal(fieldOf(text, "step"), "implement/tests");
  assert.ok(!recordIn(text).some((one) => one.stale), "no leaf stands stale");
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a process edit past the step keeps the earlier leaves, and the ticket takes the new route", () => {
  const hash = processHash(`for: a route in two phases\n${ROUTE()}`);
  const built = made(CHILD("implement/change", hash));
  passedUpTo(built, "implement/change");
  built.disk.write(
    PROCESS,
    `for: a route in two phases\n${ROUTE(undefined, "runs every test")}`,
  );
  pull(built);

  const text = textOf(built);
  assert.equal(fieldOf(text, "step"), "implement/change", "the step stands");
  assert.match(text, /does: runs every test/, "the leaf ahead takes the new route");
  assert.ok(!recordIn(text).some((one) => one.stale), "no earlier leaf stands stale");
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a process edit before the step sends it back to the first leaf whose definition moved", () => {
  const hash = processHash(`for: a route in two phases\n${ROUTE()}`);
  const built = made(CHILD("implement/tests", hash));
  passedUpTo(built, "implement/tests");
  built.disk.write(
    PROCESS,
    `for: a route in two phases\n${ROUTE("reads the approach twice")}`,
  );
  pull(built);

  const text = textOf(built);
  assert.equal(
    fieldOf(text, "step"),
    "design/review",
    "the step goes back to the moved leaf",
  );
  assert.match(text, /does: reads the approach twice/);
  assert.equal(
    entryOf(text, "design/draft").stale,
    undefined,
    "the leaf before it stays whole",
  );
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("the offer reads a moved input before it names the leaf a hand takes", () => {
  const built = made(CHILD("implement/tests"));
  passedUpTo(built, "implement/tests");
  built.disk.write(TICKET, textOf(built).replace("The approach.", "Another approach."));
  const one = {
    name: "a-child",
    path: "spec/tickets/a-child.md",
    at: TICKET,
    text: textOf(built),
  };
  one.front = frontOf(one.text);

  const said = offer(built.it, { hand: "box d462e994b4cef", group: "one-group" }, one, [
    one,
  ]);

  assert.equal(said.leaf?.path, "design/review", JSON.stringify(said));
});

// [[spec/design_output/pull#an-input-marks-its-steps]]
test("a pass writes the inputs and the definition hash beside the tips it records", () => {
  const built = made(CHILD("design/review"));
  const text = passedUpTo(built, "design/review");
  const one = { name: "a-child", path: "spec/tickets/a-child.md", at: TICKET, text };
  one.front = frontOf(text);
  const leaf = leafOf(one.front, "design/review");

  heard(() =>
    passed(
      { ...built.it, root: ROOT },
      { hand: "box d462e994b4cef" },
      one,
      leaf,
      { hash: SHA },
      [],
    ),
  );

  const entry = entryOf(textOf(built), "design/review");
  assert.deepEqual(entry.inputs, inputsOf(built.it, text, leaf));
  assert.equal(entry.def, defOf(built.it, text, leaf));
  assert.equal(entry.hash_before, SHA);
});

// A copy stranding a recorded leaf leaves the record pointing nowhere, so the ticket waits for ticket update. [[spec/design_output/pull#an-input-marks-its-steps]]
test("a process edit dropping a leaf the record names leaves the ticket as it stands", () => {
  const hash = processHash(`for: a route in two phases\n${ROUTE()}`);
  const built = made(CHILD("implement/tests", hash));
  const before = passedUpTo(built, "implement/tests");
  const renamed = ROUTE()
    .replace("      - name: review\n", "      - name: read\n")
    .replace("input: [ask, design/review]", "input: [ask, design/read]");
  built.disk.write(PROCESS, `for: a route in two phases\n${renamed}`);
  pull(built);

  const text = textOf(built);
  assert.equal(fieldOf(text, "step"), "implement/tests");
  assert.equal(
    fieldOf(text, "process_hash"),
    hash,
    "the ticket keeps the route it copied",
  );
  assert.equal(frontOf(text).steps.length, frontOf(before).steps.length);
  assert.match(text, /- name: review\n/, "the recorded leaf stands in the route");
});
