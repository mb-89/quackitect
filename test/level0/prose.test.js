// The prose reader, and the tool a hand runs over a draft before it writes.
// A finding the caps and the word list answer for stands down, and every
// other one stays. Vale stands as a fake here, so the read alone speaks.
// [[spec/design_output/level0#a-note-reads-clean-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  longest,
  PROSE_CALL,
  readsDraft,
  SPECS,
  TOOLS,
  withoutFalseLength,
  withoutFalseOutside,
} from "../../src/bridge/prose.js";

const LONG = "This one sentence runs on past the ceiling a draft holds.";

const box = (found = []) => ({
  vale: {
    stands: () => true,
    lint: async () => ({ ran: true, found }),
  },
  disk: { exists: () => false, read: () => "" },
  log: { say: () => {} },
  root: "/tree",
  method: "/tree",
});

// The dispatch unwraps one shape, so every case reads the answer through it. [[spec/design_output/level0#a-note-reads-clean-first]]
const answered = async (ask, it) => {
  const said = await TOOLS[PROSE_CALL](ask, it);
  assert.equal(
    typeof said?.result?.result,
    "string",
    "the answer takes the tool shape",
  );
  return said.result.result;
};

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("a clean draft answers no finding, and the tool writes nothing", async () => {
  const said = await answered({ path: "spec/guidance/a.md", text: "A line.\n" }, box());

  assert.match(said, /No finding stands/);
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("a draft carrying a fault answers the finding, with its rule and its line", async () => {
  const found = [
    { rule: "VoiceShape.Antithesis", line: 1, column: 1, message: LONG, severity: 2 },
  ];

  const said = await answered(
    { path: "spec/guidance/a.md", text: `${LONG}\n` },
    box(found),
  );

  assert.match(said, /VoiceShape\.Antithesis/);
  assert.match(said, /spec\/guidance\/a\.md/);
  assert.doesNotMatch(said, /refuse this write/, "the tool writes nothing to refuse");
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("the tool takes a path and a text, and refuses a call missing either", async () => {
  assert.match(await answered({ text: "A line.\n" }, box()), /path/);
  assert.match(await answered({ path: "spec/guidance/a.md" }, box()), /text/);
});

// [[spec/design_output/level0#a-note-reads-clean-first]]
test("the module registers the pair the server imports for each bridge module", () => {
  const specs = SPECS();

  assert.equal(specs.length, 1);
  assert.equal(specs[0].name, "check_prose");
  assert.deepEqual(Object.keys(specs[0].inputSchema.properties).sort(), [
    "path",
    "text",
  ]);
  assert.equal(TOOLS[PROSE_CALL], readsDraft, "the pair names the handler");
});

// [[spec/design_output/level0#the-tense-reader]]
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
