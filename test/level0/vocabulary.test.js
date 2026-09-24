// The vocabulary layer. Fixture lists of a few words stand in for the three
// files, so every case here reads the projector and the refusal and touches
// no disk.
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
  CORE,
  coreOf,
  knownIn,
  looseMeanings,
  pathsOf,
  STEMS,
  stemsOf,
  SWAPS,
  swapsOf,
  TERMS,
  termsOf,
  wordsOf,
} from "../../.claude/skills/level0/lib/vocabulary.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SOURCE = "spec/schemas/paragraph.schema.yaml";
const TARGET = "spec/config/styles/VoiceParagraph";

const CORE_TEXT = `
words:
  - {word: a, pos: DET, from: openste}
  - {word: the, pos: DET, from: openste}
  - {word: refuse, pos: VERB, from: openste}
  - {word: but, pos: CCONJ, from: openste}
  - {word: read-only, from: common}
  - {word: Bad_Word, from: common}
`;

const TERMS_TEXT = `
terms:
  - {word: door, means: "the refuse gate"}
  - {word: write, means: "a door with no refusal", source: "https://example.org/write"}
  - {word: level zero}
  - {word: jargon}
`;

const STEMS_TEXT = `
endings:
  - end: s
    to: [none]
  - end: ed
    to: [none, e, drop]
  - end: zz
    to: [y]
    long: true
prefixes: [un]
`;

const SWAPS_TEXT = `
swaps:
  - {word: deny, write: refuse}
  - {word: however, write: but}
  - {word: door, write: gate}
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
    core: ${CORE}
    terms: ${TERMS}
    swaps: ${SWAPS}
    endings: ${STEMS}
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

const lists = () => ({
  core: readYaml(CORE_TEXT),
  terms: readYaml(TERMS_TEXT),
  swaps: readYaml(SWAPS_TEXT),
  stems: readYaml(STEMS_TEXT),
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the schema names the three lists, and leaves a missing one at its default", () => {
  assert.deepEqual(pathsOf(readYaml(SCHEMA)), {
    core: CORE,
    terms: TERMS,
    swaps: SWAPS,
    endings: STEMS,
  });
  assert.deepEqual(
    pathsOf(readYaml("kind: paragraph\nlayers:\n  vocabulary:\n    terms: t.yml\n")),
    {
      core: CORE,
      terms: "t.yml",
      swaps: SWAPS,
      endings: STEMS,
    },
  );
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the core and the terms read their entries, and a malformed word drops out", () => {
  assert.deepEqual(
    coreOf(readYaml(CORE_TEXT)).map((one) => one.word),
    ["a", "the", "refuse", "but", "read-only"],
  );
  assert.deepEqual(
    termsOf(readYaml(TERMS_TEXT)).map((one) => one.word),
    ["door", "write", "level zero", "jargon"],
  );
  assert.deepEqual(coreOf(undefined), []);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("a term answers what it means, and the source it cites", () => {
  const [door, write, zero] = termsOf(readYaml(TERMS_TEXT));
  assert.equal(door.means, "the refuse gate");
  assert.equal(door.source, "");
  assert.equal(write.means, "a door with no refusal");
  assert.equal(write.source, "https://example.org/write");
  assert.equal(zero.means, "");
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("a means line answers every word the lists leave out, and a stem stands", () => {
  assert.deepEqual(looseMeanings(lists()), [
    { word: "door", loose: ["gate"] },
    { word: "write", loose: ["door", "with", "refusal"] },
  ]);
});

// The rule and the check read one table of endings, and the lists hand it in. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
test("the table of endings stands a stem, a prefix, and nothing past them", () => {
  const stems = stemsOf(readYaml(STEMS_TEXT));
  const known = knownIn(new Set(["read", "refuse", "stop", "cay"]), stems);
  for (const w of ["reads", "refused", "stopped", "cazz", "unread"]) assert.ok(known(w), w);
  for (const w of ["reader", "reading", "cities", "reread", "azz"]) assert.ok(!known(w), w);
  const rule = rulesFrom(readYaml(SCHEMA), "", lists()).get("Vocabulary.yml") ?? "";
  assert.match(rule, /has_suffix\(w, "zz"\)/);
  assert.doesNotMatch(rule, /has_suffix\(w, "ing"\)/);
  assert.match(rule, /for pre in \["un"\]/);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the words join the core and the terms, split on a hyphen and a space, less the swaps", () => {
  assert.deepEqual(wordsOf(lists()), [
    "a",
    "but",
    "jargon",
    "level",
    "only",
    "read",
    "refuse",
    "the",
    "write",
    "zero",
  ]);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("a swap hands a refused word its core word, and wins over a listed word", () => {
  assert.deepEqual(
    [...swapsOf(lists())],
    [
      ["deny", "refuse"],
      ["door", "gate"],
      ["however", "but"],
    ],
  );
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the projector writes one rule inlining the words and the swaps", () => {
  const rules = rulesFrom(readYaml(SCHEMA), "", lists());
  const rule = rules.get("Vocabulary.yml");
  assert.ok(rule, "the rule stands");
  assert.match(rule, /\bdoor\b/);
  assert.match(rule, /deny=refuse/);
  assert.match(rule, /spec\/vocabulary\/terms\.yml with one line that says what it means/);
  assert.equal(rulesFrom(readYaml(SCHEMA), "", null).has("Vocabulary.yml"), false);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the projection reads the three lists the schema names, beside the schema", () => {
  const texts = new Map([[SOURCE, SCHEMA]]);
  assert.deepEqual(alsoReads(ENTRY, texts), [CORE, TERMS, SWAPS, STEMS]);
  texts.set(CORE, CORE_TEXT);
  assert.deepEqual(alsoReads(ENTRY, texts), [TERMS, SWAPS, STEMS]);
  assert.deepEqual(alsoReads({ ...ENTRY, shape: "other" }, texts), []);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("readAll takes the lists off the disk, and the rule carries the words", () => {
  const disk = fakeDisk({
    [SOURCE]: SCHEMA,
    [CORE]: CORE_TEXT,
    [TERMS]: TERMS_TEXT,
    [SWAPS]: SWAPS_TEXT,
  });
  const said = readAll([ENTRY], disk);
  const rule = said.wanted.get(`${TARGET}/Vocabulary.yml`);
  assert.match(rule, /\bdoor\b/);
  assert.match(rule, /however=but/);

  const texts = new Map([[SOURCE, SCHEMA]]);
  assert.equal(
    writesOf(ENTRY, texts).has(`${TARGET}/Vocabulary.yml`),
    false,
    "no list, no rule",
  );
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the refusal names the road for a word outside the lists", () => {
  const found = [
    {
      line: 1,
      column: 1,
      rule: "VoiceParagraph.Vocabulary",
      said: "flibbertigibbet",
      message: "x",
    },
    {
      line: 2,
      column: 1,
      rule: "VoiceParagraph.Vocabulary",
      said: "Whatsit",
      message: "x",
    },
    {
      line: 3,
      column: 1,
      rule: "VoiceParagraph.Passive",
      said: "is read",
      message: "x",
    },
  ];
  const said = grown(found);
  assert.match(said, /one line that says what it means/);
  assert.match(said, /means: "<one line>"/);
  assert.doesNotMatch(said, /defines/);
  assert.match(said, /`flibbertigibbet`, `whatsit`/);
  assert.match(said, /spec\/vocabulary\/terms\.yml/);
  assert.match(refusal("notes.md", found), /one line that says what it means/);
  assert.equal(grown(found.slice(2)), "");
});
