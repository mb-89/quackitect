// The prose reader. A finding the caps and the word list answer for stands
// down, and every other one stays.
// [[spec/design_output/level0#the-tense-reader]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  longest,
  withoutFalseLength,
  withoutFalseOutside,
} from "../../src/bridge/prose.js";

const CAPS = { sentence: 25, listItem: 20 };

const finding = (rule, line, column = 1, said = "") => ({
  rule,
  line,
  column,
  said,
  message: "a message",
});

test("the measure counts the words a sentence holds, past a code span", () => {
  assert.equal(longest("The door reads the file."), 5);
  assert.ok(longest("The `one/two/three.js` door reads the file.") < 7);
});

test("a sentence inside the cap lets its finding go", () => {
  const text = "The door reads the file.\n";

  assert.deepEqual(
    withoutFalseLength(text, [finding("VoiceParagraph.Sentence", 1)], CAPS),
    [],
  );
});

test("a sentence past the cap keeps its finding", () => {
  const long = `The door ${"and the reader ".repeat(12)}meet here.\n`;
  const kept = withoutFalseLength(long, [finding("VoiceParagraph.Sentence", 1)], CAPS);

  assert.equal(kept.length, 1);
});

test("a rule the caps say nothing about stands as it reads", () => {
  const said = [finding("VoiceVale.Antithesis", 1)];

  assert.deepEqual(withoutFalseLength("A line stands.\n", said, CAPS), said);
});

test("a word the list holds lets its finding go, and another keeps it", () => {
  const text = "The door reads the widget.\n";
  const words = () => new Set(["widget"]);
  const said = [finding("VoiceParagraph.Vocabulary", 1, 22, "widget")];

  assert.deepEqual(withoutFalseOutside(text, said, words), []);
  assert.equal(withoutFalseOutside(text, said, () => new Set()).length, 1);
});
