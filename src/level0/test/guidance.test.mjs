// The guidance parser, tested. Level zero hands the agent the Actionables
// chapter of every note, so what that chapter parses to is worth a test.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parse, actionables, standingLayer } from "../lib/guidance.mjs";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const GUIDANCE = join(root, "spec", "guidance");

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
  assert.deepEqual(Object.keys(read.chapters), ["Motivation", "Actionables", "Discussion"]);
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

test("every guidance note in this tree carries actionables", () => {
  const notes = readdirSync(GUIDANCE).filter((n) => n.endsWith(".md"));
  assert.ok(notes.length, "there is at least one guidance note");
  for (const name of notes) {
    const rules = actionables(readFileSync(join(GUIDANCE, name), "utf8"));
    assert.ok(rules.length, `${name} carries an Actionables chapter`);
    assert.ok(rules.length <= 10, `${name} holds ten rules or fewer, and holds ${rules.length}`);
  }
});
