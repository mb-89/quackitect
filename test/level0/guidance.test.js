// The guidance parser, tested. Level zero hands the agent the Actionables
// chapter of every note, so what that chapter parses to is worth a test. The
// cases reading the notes this tree ships stand in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  actionables,
  bindsHere,
  canary,
  canaryIn,
  countsOf,
  envOf,
  parse,
  standingLayer,
} from "../../.claude/skills/level0/lib/guidance.js";

const note = `---
kind: [[guidance]]
scope: ["everybody"]
---

# Motivation

Why this note exists.

# Actionables

1. The first rule, which a person applies.
2. The second rule, which needs an argument. *

# Discussion

## 2. The second rule

Because of a thing that happened.
`;

test("a note parses into its three chapters", () => {
  const read = parse(note);
  assert.deepEqual(Object.keys(read.chapters), [
    "Motivation",
    "Actionables",
    "Discussion",
  ]);
  assert.match(read.chapters.Motivation, /Why this note exists/);
  assert.equal(read.front.kind, "[[guidance]]");
});

test("the actionables come out one per item, with the marker stripped", () => {
  assert.deepEqual(actionables(note), [
    "The first rule, which a person applies.",
    "The second rule, which needs an argument.",
  ]);
});

test("a note carrying no actionables answers none", () => {
  assert.deepEqual(actionables("# Motivation\n\nNothing else.\n"), []);
});

test("the standing layer carries every note under its own title", () => {
  const said = standingLayer([
    { name: "voice.md", text: note },
    { name: "empty.md", text: "# Motivation\n\nNothing.\n" },
  ]);
  assert.match(said, /### voice/);
  assert.match(said, /1\. The first rule/);
  assert.doesNotMatch(said, /### empty/, "a note with no rules adds no heading");
});

test("the standing layer carries no Discussion chapter", () => {
  const said = standingLayer([{ name: "voice.md", text: note }]);
  assert.doesNotMatch(said, /Because of a thing that happened/);
});

test("a note naming no variable binds every box", () => {
  assert.equal(bindsHere(note, {}), true);
  assert.deepEqual(envOf(note), []);
});

test("a note names the variables it waits for", () => {
  const waits = `---\nkind: [[guidance]]\nenv:\n  - ONE\n  - TWO\n---\n\n# Actionables\n\n1. Do it.\n`;
  assert.deepEqual(envOf(waits), ["ONE", "TWO"]);
  assert.equal(bindsHere(waits, {}), false, "no variable set");
  assert.equal(bindsHere(waits, { TWO: "1" }), true, "one of them is enough");
});

test("an empty, zero or false value switches nothing on", () => {
  const waits = `---\nkind: [[guidance]]\nenv: ONE\n---\n\n# Actionables\n\n1. Do it.\n`;
  for (const said of ["", "0", "false", "FALSE", "  "]) {
    assert.equal(
      bindsHere(waits, { ONE: said }),
      false,
      `${JSON.stringify(said)} is no value`,
    );
  }
  for (const said of ["1", "true", "yes"]) {
    assert.equal(
      bindsHere(waits, { ONE: said }),
      true,
      `${JSON.stringify(said)} is a value`,
    );
  }
});

// [[spec/design_output/level0#the-canary]]
test("the canary carries the counts level zero loaded", () => {
  assert.equal(
    canary({ rules: 14, notes: 5, stop: true }),
    "level0 holds this session: 14 rules, 5 notes, the stop hook on.",
  );
  assert.match(canary({ rules: 1, notes: 1, stop: false }), /the stop hook off\.$/);
});

test("the canary counts the notes carrying a rule", () => {
  const empty = `---\nkind: [[guidance]]\n---\n\n# Motivation\n\nNothing to do.\n`;
  assert.deepEqual(
    countsOf([
      { name: "a.md", text: note },
      { name: "b.md", text: empty },
    ]),
    {
      notes: 1,
      rules: 2,
    },
  );
});

test("an answer saying the line word for word comes back as the same", () => {
  const said = canary({ rules: 14, notes: 5, stop: true });
  const answer = `The work stands pushed.\n\n${said}\n`;
  assert.deepEqual(canaryIn(answer, said), { found: "same", said });
});

test("an answer saying other counts comes back with both", () => {
  const said = canary({ rules: 14, notes: 5, stop: true });
  const other = canary({ rules: 9, notes: 5, stop: true });
  assert.deepEqual(canaryIn(`I read ${other}`, said), { found: "other", said: other });
});

test("an answer saying nothing comes back absent", () => {
  const said = canary({ rules: 14, notes: 5, stop: true });
  assert.deepEqual(canaryIn("The work stands pushed.", said), {
    found: "none",
    said: "",
  });
});
