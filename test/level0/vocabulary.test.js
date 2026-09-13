// The vocabulary layer. A fixture list of ten words stands in for the seed, so
// every case here reads the projector and the refusal and touches no disk.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PARAGRAPH, rulesFrom } from "../../.claude/skills/level0/lib/paragraph.js";
import {
  alsoReads,
  readAll,
  writesOf,
} from "../../.claude/skills/level0/lib/projection.js";
import { grown, refusal } from "../../.claude/skills/level0/lib/refuse.js";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import {
  addedIn,
  entriesOf,
  LIST,
  pathOf,
  swapsOf,
  wordsOf,
} from "../../.claude/skills/level0/lib/vocabulary.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SOURCE = "spec/schemas/paragraph.schema.yaml";
const TARGET = "spec/config/styles/VoiceParagraph";

const WORDS = `
# The fixture list, ten words and two swaps.
words:
  - {word: a, pos: DET, from: openste}
  - {word: the, pos: DET, from: openste}
  - {word: door, from: tree}
  - {word: refuse, pos: VERB, from: openste, insteadOf: [deny]}
  - {word: write, from: tree}
  - {word: but, pos: CCONJ, from: openste, insteadOf: [however]}
  - {word: word, from: tree}
  - {word: stand, from: tree}
  - {word: read-only, from: tree}
  - {word: grow, from: session, meaning: the list takes a word}
`;

const SCHEMA = `
kind: paragraph
layers:
  characters:
    punctuation: [full stop]
    exceptions: []
  markup:
    heading:
      words: 5
    exceptions: []
  shape:
    sentencesPerParagraph: 6
    paragraphsPerRun: 3
    exceptions: []
  sentence:
    words:
      max: 25
      listItem: 20
    codeSpans: 4
    exceptions: []
  grammar:
    tenses: [simple present]
    modals: [can, must, will]
    exceptions: []
  vocabulary:
    words: spec/vocabulary/words.yml
    exceptions:
      - word: TL;DR
        reason: a name the answer register uses
`;

const ENTRY = {
  name: "the paragraph rules",
  shape: PARAGRAPH,
  target: TARGET,
  from: SOURCE,
  wrap: "none",
};

const list = () => readYaml(WORDS);

const drawn = () =>
  writesOf(
    ENTRY,
    new Map([
      [SOURCE, SCHEMA],
      ["spec/vocabulary/words.yml", WORDS],
    ]),
  );

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the list reads one entry a line, and a flow mapping holds the fields", () => {
  const rows = entriesOf(list());
  assert.equal(rows.length, 10);
  assert.deepEqual(rows[0], { word: "a", from: "openste", meaning: "", insteadOf: [] });
  assert.deepEqual(rows[3].insteadOf, ["deny"]);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a hyphen in an entry puts both parts in the set", () => {
  const said = wordsOf(list());
  assert.ok(said.includes("read"), "the first part stands");
  assert.ok(said.includes("only"), "the second part stands");
  assert.deepEqual(
    said,
    [...said].sort(),
    "the set stands sorted, so the rule reads the same twice",
  );
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a swap names the better word, and a word on the list takes none", () => {
  const said = swapsOf(list());
  assert.equal(said.get("deny"), "refuse");
  assert.equal(said.get("however"), "but");
  assert.equal(said.size, 2);

  const both = readYaml(`${WORDS}  - {word: deny, from: tree}\n`);
  assert.equal(
    swapsOf(both).has("deny"),
    false,
    "an entry beats somebody else's insteadOf, so the rule admits the word",
  );
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the retro reads what the session added", () => {
  assert.deepEqual(
    addedIn(list()).map((one) => one.word),
    ["grow"],
  );
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the schema names the list, and the reader takes a second pass for it", () => {
  assert.equal(pathOf(readYaml(SCHEMA)), "spec/vocabulary/words.yml");
  assert.equal(pathOf({}), "");

  const texts = new Map([[SOURCE, SCHEMA]]);
  assert.deepEqual(alsoReads(ENTRY, texts), ["spec/vocabulary/words.yml"]);
  texts.set("spec/vocabulary/words.yml", WORDS);
  assert.deepEqual(
    alsoReads(ENTRY, texts),
    [],
    "a text it already holds it reads once",
  );
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the rule carries every word of the list and every swap", () => {
  const said = drawn().get(`${TARGET}/Vocabulary.yml`);
  for (const one of wordsOf(list())) {
    assert.match(said, new RegExp(`\\b${one}\\b`), `${one} stands in the rule`);
  }
  assert.match(said, /deny=refuse/);
  assert.match(said, /however=but/);
  assert.match(said, /^extends: script$/m);
  assert.match(said, /scope: raw/);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a word the layer leaves standing is blanked before the scan", () => {
  assert.match(drawn().get(`${TARGET}/Vocabulary.yml`), /blanked\(said, "TL;DR"\)/);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("no list means no rule, so a missing file writes no empty set", () => {
  assert.equal(rulesFrom(readYaml(SCHEMA), "", null).has("Vocabulary.yml"), false);
  assert.equal(rulesFrom(readYaml(SCHEMA), "", {}).has("Vocabulary.yml"), false);
  assert.equal(rulesFrom(readYaml(SCHEMA), "", list()).has("Vocabulary.yml"), true);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the reader takes the list off the disk beside the schema", () => {
  const files = fakeDisk({
    [SOURCE]: SCHEMA,
    "spec/vocabulary/words.yml": WORDS,
  });
  const said = readAll([ENTRY], files);
  assert.ok(said.wanted.has(`${TARGET}/Vocabulary.yml`));
  assert.match(said.wanted.get(`${TARGET}/Vocabulary.yml`), /however=but/);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the refusal names the list, the word and the entry to write", () => {
  const found = [
    {
      rule: "Vocabulary",
      line: 3,
      column: 5,
      said: "Flibbertigibbet",
      message: "nope",
    },
  ];
  const said = grown(found);
  assert.match(said, new RegExp(LIST.replace(/[.]/g, "\\.")));
  assert.match(said, /`flibbertigibbet`/, "the word reads in lower case");
  assert.match(said, /from: session/);
  assert.match(said, /the retro keeps the entry or cuts it/);
  assert.match(refusal("notes.md", found), /where it grows/);
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("a refusal carrying no outside word says nothing about the list", () => {
  const found = [
    { rule: "Sentence", line: 1, column: 1, said: "The", message: "long" },
  ];
  assert.equal(grown(found), "");
  assert.equal(grown([]), "");
  assert.ok(!refusal("notes.md", found).includes("where it grows"));
});

// [[spec/funnel/a-paragraph-has-a-schema]]
test("the refusal counts the words past the five it names", () => {
  const found = "abcdefg".split("").map((one) => ({ rule: "Vocabulary", said: one }));
  assert.match(grown(found), /and 2 more/);
});
