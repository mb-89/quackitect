// The paragraph schema, projected. Every case here hands the projector a
// schema and reads the rule files it answers, so no disk is touched.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  faultsOf,
  PARAGRAPH,
  rulesFrom,
} from "../../.claude/skills/level0/lib/paragraph.js";
import {
  faultsIn,
  readAll,
  staleIn,
  writesOf,
} from "../../.claude/skills/level0/lib/projection.js";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SOURCE = "spec/schemas/paragraph.schema.yaml";
const SHAPE = "spec/schemas/paragraph.schema.schema.json";
const TARGET = "spec/config/styles/VoiceParagraph";

const SCHEMA = `
kind: paragraph
misreads: 3

layers:
  characters:
    admits: letters, digits, space, and the punctuation below
    punctuation: [full stop, comma, hyphen]
    exceptions:
      - word: TL;DR
        reason: a name the answer register uses
  markup:
    admits:
      - a code span
    heading:
      words: 5
      oneTitle: true
    strongLead:
      words: 4
    exceptions: []
  shape:
    sentencesPerParagraph: 6
    paragraphsPerRun: 3
    listWhen: three or more parallel things stand in one sentence
    exceptions: []
  sentence:
    words:
      min: 2
      max: 25
      listItem: 20
    opensWith: [a capital]
    closesWith: [".", "?", "!"]
    codeSpans: 4
    exceptions: []
  grammar:
    finiteVerbs: 1
    tenses: [simple present, simple past]
    auxiliaryChains: refused
    modals: [can, must, will]
    contractions: refused
    latinShortForms: refused
    exceptions:
      - word: held
        reason: a status here
  vocabulary:
    words: spec/vocabulary/words.yml
    outside:
      - a code span
    growth:
      who: the session
      entry: word, meaning, from
      review: the retro reads it
    exceptions: []
  meaning:
    judged:
      - id: Actionable
        asks: does this text tell the reader something they can act on?
        labels: [actionable, background]
        refuses: background

registers:
  prose:
    paths: ["*.md"]
  answer:
    paths: ["*answer.md"]
    shape:
      sentencesPerParagraph: 3
      paragraphsPerRun: 2
    opens:
      - block: tldr
        when: always
        shape: a list
    then: the detail, under headings
  requirement:
    paths: ["spec/requirements/*.md"]
    grammar:
      modals: [can, must, will, shall, should]
`;

const ENTRY = {
  name: "the paragraph rules",
  shape: PARAGRAPH,
  target: TARGET,
  from: SOURCE,
  schema: SHAPE,
  wrap: "none",
};

const SHAPE_JSON = JSON.stringify({
  type: "object",
  required: ["kind", "layers"],
  properties: {
    kind: { type: "string" },
    misreads: { type: "number" },
    layers: {
      type: "object",
      required: ["characters", "markup", "shape", "sentence", "grammar"],
      properties: {
        shape: {
          type: "object",
          required: ["sentencesPerParagraph"],
          properties: { sentencesPerParagraph: { type: "number" } },
        },
        grammar: {
          type: "object",
          properties: {
            auxiliaryChains: { type: "string", enum: ["refused", "admitted"] },
          },
        },
      },
    },
  },
});

const drawn = () =>
  writesOf(
    ENTRY,
    new Map([
      [SOURCE, SCHEMA],
      [SHAPE, SHAPE_JSON],
    ]),
  );

// [[spec/design_output/projection#the-second-target]]
test("every layer takes its rule file, and the answer register takes its own", () => {
  assert.deepEqual([...drawn().keys()].sort(), [
    `${TARGET}/Auxiliary.yml`,
    `${TARGET}/Characters.yml`,
    `${TARGET}/CodeSpans.yml`,
    `${TARGET}/Contraction.yml`,
    `${TARGET}/EtCetera.yml`,
    `${TARGET}/Latin.yml`,
    `${TARGET}/ListItem.yml`,
    `${TARGET}/Markup.yml`,
    `${TARGET}/Modal.yml`,
    `${TARGET}/Paragraph.yml`,
    `${TARGET}/ParagraphAnswer.yml`,
    `${TARGET}/PastTense.yml`,
    `${TARGET}/Progressive.yml`,
    `${TARGET}/Sentence.yml`,
    `${TARGET}/Shape.yml`,
    `${TARGET}/ShapeAnswer.yml`,
  ]);
});

// [[spec/design_output/projection#the-second-target]]
test("a cap moves in the schema, and the rule file carrying it follows", () => {
  const files = drawn();
  assert.match(files.get(`${TARGET}/Paragraph.yml`), /max: 6/);
  assert.match(files.get(`${TARGET}/ParagraphAnswer.yml`), /max: 3/);
  assert.match(files.get(`${TARGET}/Sentence.yml`), /max: 25/);
  assert.match(files.get(`${TARGET}/Shape.yml`), /run > 3/);
  assert.match(files.get(`${TARGET}/ShapeAnswer.yml`), /run > 2/);
  assert.match(files.get(`${TARGET}/ListItem.yml`), /n > 20/);
  assert.match(files.get(`${TARGET}/CodeSpans.yml`), /len\(seen\) > 4/);

  const tighter = rulesFrom({
    layers: { shape: { sentencesPerParagraph: 4, paragraphsPerRun: 2 } },
  });
  assert.match(tighter.get("Paragraph.yml"), /max: 4/);
  assert.match(tighter.get("Shape.yml"), /run > 2/);
});

// [[spec/design_output/projection#the-schema-names-a-mark]]
test("the punctuation stands by name, and the rule carries the character", () => {
  const said = drawn().get(`${TARGET}/Characters.yml`);
  assert.match(said, /\\\.\\,\\-/, "the set reads full stop, comma and hyphen");
  assert.ok(!said.includes("\\?"), "a mark the schema leaves out stands nowhere");
});

// [[spec/design_output/projection#the-grammar-rules]]
test("a word the retro leaves standing reaches every rule reading a tag", () => {
  const files = drawn();
  assert.match(files.get(`${TARGET}/PastTense.yml`), /^ {2}- held$/m);
  assert.match(files.get(`${TARGET}/Auxiliary.yml`), /^ {2}- has held$/m);
  assert.match(files.get(`${TARGET}/Progressive.yml`), /^ {2}- is held$/m);
  assert.match(
    files.get(`${TARGET}/Characters.yml`),
    /blanked\(said, "TL;DR"\)/,
    "a phrase the characters layer leaves standing is blanked before the scan",
  );
});

// [[spec/design_output/projection#the-grammar-rules]]
test("the modal rule refuses every modal the register leaves out", () => {
  const said = drawn().get(`${TARGET}/Modal.yml`);
  for (const one of ["could", "may", "might", "ought", "shall", "should", "would"]) {
    assert.match(said, new RegExp(`\\\\b${one}\\\\b`), `${one} is refused`);
  }
  for (const one of ["can", "must", "will"]) {
    assert.ok(!said.includes(`\\b${one}\\b`), `${one} stands in the register`);
  }
});

// [[spec/design_output/projection#the-grammar-rules]]
test("a swap key stands in single quotes, because a double quote eats a boundary", () => {
  const files = drawn();
  assert.match(files.get(`${TARGET}/Latin.yml`), /^ {2}'\\be\\\.g\\\.':/m);
  assert.match(files.get(`${TARGET}/EtCetera.yml`), /^ {2}'\\betc\\\.':/m);
  assert.match(files.get(`${TARGET}/Contraction.yml`), /^ {2}'\(c\)an''t':/m);
});

// [[spec/design_output/projection#the-second-target]]
test("every rule file opens with the mark saying who writes it", () => {
  for (const [path, text] of drawn()) {
    assert.match(text, /^# GENERATED\./, path);
    assert.match(text, /spec\/schemas\/paragraph\.schema\.yaml/, path);
    assert.match(text, /^extends: /m, path);
  }
});

// [[spec/design_output/projection#a-missing-layer-fails]]
test("a layer that goes missing fails, and a whole schema answers nothing", () => {
  const shape = JSON.parse(SHAPE_JSON);
  assert.deepEqual(faultsOf(readSchema(), shape), []);

  const short = SCHEMA.replace(/ {2}grammar:[\s\S]*? {2}vocabulary:/, "  vocabulary:");
  assert.deepEqual(
    faultsIn(
      ENTRY,
      new Map([
        [SOURCE, short],
        [SHAPE, SHAPE_JSON],
      ]),
    ),
    [`${SOURCE}: layers.grammar is missing`],
  );
});

// [[spec/design_output/projection#a-missing-layer-fails]]
test("a key carrying the wrong kind fails, and so does a value off the list", () => {
  const shape = JSON.parse(SHAPE_JSON);
  const said = readSchema();

  said.layers.shape.sentencesPerParagraph = "six";
  assert.deepEqual(faultsOf(said, shape), [
    "layers.shape.sentencesPerParagraph carries a string, and the shape says number",
  ]);

  said.layers.shape.sentencesPerParagraph = 6;
  said.layers.grammar.auxiliaryChains = "sometimes";
  assert.deepEqual(faultsOf(said, shape), [
    'layers.grammar.auxiliaryChains reads "sometimes", and the shape admits refused, admitted',
  ]);
});

// [[spec/design_output/projection#a-shape-says-its-ending]]
test("the compare reads the ending this shape writes, and leaves the rest", () => {
  const disk = fakeDisk({ [SOURCE]: SCHEMA, [SHAPE]: SHAPE_JSON });
  disk.makeDir(TARGET);

  const first = readAll([ENTRY], disk);
  assert.equal(first.wanted.size, 16);
  assert.deepEqual(first.faults, []);
  assert.deepEqual(
    [...new Set(staleIn(first.wanted, first.standing).map((one) => one.how))],
    ["missing"],
  );

  for (const [path, text] of first.wanted) disk.write(path, text);
  disk.write(`${TARGET}/README.md`, "a person writes this, and no shape owns it\n");
  const said = readAll([ENTRY], disk);
  assert.deepEqual(
    staleIn(said.wanted, said.standing),
    [],
    "the markdown is no target",
  );

  disk.write(`${TARGET}/Sentence.yml`, "somebody edits this by hand\n");
  const now = readAll([ENTRY], disk);
  assert.deepEqual(staleIn(now.wanted, now.standing), [
    { path: `${TARGET}/Sentence.yml`, how: "differs" },
  ]);
});

function readSchema() {
  return readYaml(SCHEMA);
}
