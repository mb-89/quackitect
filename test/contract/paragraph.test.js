// Every rule the paragraph schema projects, through the real Vale. A rule
// asserted against a stub is a rule nobody has run, so each case feeds the
// binary something the rule refuses and something it passes, off the one run
// the helper makes for this file.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withoutFalsePast } from "../../src/engine/tense.js";
import { at, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const { proves } = rulesIn(root);

const ANSWER = "answer.md";
const answer = (text) => at(text, ANSWER);

const refuses = (said, rule, key) =>
  assert.ok(
    said.rules(key).includes(rule),
    `${rule} fires on ${key}: ${said.rules(key).join(", ") || "nothing"}`,
  );

const passes = (said, rule, key) =>
  assert.ok(
    !said.rules(key).includes(rule),
    `${rule} stays quiet on ${key}: ${said.rules(key).join(", ")}`,
  );

const sentences = (n) =>
  Array.from({ length: n }, (_, i) => `Sentence number ${i} stands here.`).join(" ");
const paragraphs = (n) =>
  Array.from({ length: n }, (_, i) => `Paragraph number ${i} stands here.`).join(
    "\n\n",
  );

// [[spec/design_output/projection#the-second-target]]
proves(
  "a character outside the set is refused, and a code span passes",
  {
    semicolon: "The engine reads it, and the reader waits; so it goes.\n",
    plain: "The engine reads it, and the reader waits.\n",
    span: "The engine reads `a; b` and the reader waits.\n",
    fenced: "```\nThe engine; the reader.\n```\n",
    tldr: "The TL;DR list opens the answer.\n",
    path: "The door reads spec/config/styles and answers.\n",
  },
  (said) => {
    refuses(said, "Characters", "semicolon");
    for (const key of ["plain", "span", "fenced", "tldr", "path"])
      passes(said, "Characters", key);
  },
);

// [[spec/design_output/projection#the-second-target]]
proves(
  "a long heading, a second title and a long lead are refused",
  {
    long: "# This heading holds far too many words here\n",
    short: "# A short heading\n",
    two: "# A heading: two things\n",
    one: "# One thing\n",
    lead: "- **A strong lead running far too long** the rest.\n",
    brief: "- **A short lead** the rest.\n",
  },
  (said) => {
    for (const key of ["long", "two", "lead"]) refuses(said, "Markup", key);
    for (const key of ["short", "one", "brief"]) passes(said, "Markup", key);
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
proves(
  "a run of four paragraphs is refused, and three pass",
  { four: `${paragraphs(4)}\n`, three: `${paragraphs(3)}\n` },
  (said) => {
    refuses(said, "Shape", "four");
    passes(said, "Shape", "three");
  },
);

// [[spec/design_output/projection#the-list-opens-an-answer]]
const opened = (n) => `- The bottom line stands here.\n\n${paragraphs(n)}`;

// [[spec/design_output/projection#a-layer-writes-two-files]]
proves(
  "the answer register takes the tighter run, and prose keeps its own",
  {
    three: answer(`${opened(3)}\n`),
    two: answer(`${opened(2)}\n`),
    prose: `${paragraphs(3)}\n`,
  },
  (said) => {
    refuses(said, "ShapeAnswer", "three");
    passes(said, "ShapeAnswer", "two");
    passes(said, "ShapeAnswer", "prose");
  },
);

// [[spec/design_output/level0#the-question-comes-first]]
const TABLE = "| question | answer |\n|---|---|\n| where | here |\n";

// [[spec/design_output/projection#the-list-opens-an-answer]]
proves(
  "an answer opening with a heading or prose is refused",
  {
    heading: answer("# One thing\n\n- The bottom line.\n"),
    prose: answer("The bottom line stands here.\n"),
    list: answer("- The bottom line stands here.\n"),
    numbered: answer("1. The bottom line stands here.\n"),
    tableThenList: answer(`${TABLE}\n- The bottom line.\n`),
    tableThenHeading: answer(`${TABLE}\n# One thing\n`),
    note: "# One thing\n\nThe line stands here.\n",
  },
  (said) => {
    for (const key of ["heading", "prose", "tableThenHeading"])
      refuses(said, "ShapeAnswer", key);
    for (const key of ["list", "numbered", "tableThenList", "note"])
      passes(said, "ShapeAnswer", key);
  },
);

const TWO_UNDER_ONE = "- The bottom line.\n\n# One\n\nA paragraph.\n\nA second paragraph.\n";

proves(
  "a heading opens a fresh prose budget, and a third paragraph breaks it",
  {
    two: answer(TWO_UNDER_ONE),
    across: answer(`${TWO_UNDER_ONE}\n# Two\n\nA paragraph.\n\nA second paragraph.\n`),
    three: answer(`${TWO_UNDER_ONE}\nA third paragraph.\n`),
  },
  (said) => {
    passes(said, "ShapeAnswer", "two");
    passes(said, "ShapeAnswer", "across");
    refuses(said, "ShapeAnswer", "three");
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
proves(
  "a paragraph over the sentence cap is refused, in prose and in an answer",
  {
    seven: `${sentences(7)}\n`,
    six: `${sentences(6)}\n`,
    four: answer(`${sentences(4)}\n`),
    three: answer(`${sentences(3)}\n`),
  },
  (said) => {
    refuses(said, "Paragraph", "seven");
    passes(said, "Paragraph", "six");
    refuses(said, "ParagraphAnswer", "four");
    passes(said, "ParagraphAnswer", "three");
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
proves(
  "a sentence over the word cap is refused, and a list item takes less",
  {
    long: `The engine ${"and the reader ".repeat(12)}meet here.\n`,
    short: "The engine and the reader meet here.\n",
    item: `- The engine ${"and the reader ".repeat(7)}meet here.\n`,
    brief: "- The engine and the reader meet here.\n",
  },
  (said) => {
    refuses(said, "Sentence", "long");
    passes(said, "Sentence", "short");
    refuses(said, "ListItem", "item");
    passes(said, "ListItem", "brief");
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
proves(
  "a sentence over the code span cap is refused, and a table row passes",
  {
    five: "It reads `a`, `b`, `c`, `d` and `e` here.\n",
    four: "It reads `a`, `b`, `c` and `d` here.\n",
    row: "| `a` | `b` | `c` | `d` | `e` |\n| - | - | - | - | - |\n",
  },
  (said) => {
    refuses(said, "CodeSpans", "five");
    passes(said, "CodeSpans", "four");
    passes(said, "CodeSpans", "row");
  },
);

// [[spec/tickets/voice-rules-skip-the-record]]
const FRONT_SPANS = "It reads `a`, `b`, `c`, `d`, `e`, `f` and `g` here.";

// [[spec/tickets/voice-rules-skip-the-record]]
const noted = (key) =>
  `---\nkind: ticket\nrecord:\n  - step: do\n    ${key}: ${FRONT_SPANS}\n---\n\nA body.\n`;

// [[spec/tickets/voice-rules-skip-the-record]]
proves(
  "a record the verbs wrote passes, and a field the schema calls prose is read",
  {
    why: noted("why"),
    asks: noted("asks"),
    says: noted("says"),
    does: noted("does"),
    body: `---\nkind: ticket\n---\n\n${FRONT_SPANS}\n`,
  },
  (said) => {
    passes(said, "CodeSpans", "why");
    passes(said, "CodeSpans", "asks");
    refuses(said, "CodeSpans", "says");
    refuses(said, "CodeSpans", "does");
    refuses(said, "CodeSpans", "body");
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
proves(
  "the perfect and the progressive are refused, and the simple tense passes",
  {
    perfect: "The engine has written the file.\n",
    simple: "The engine writes the file.\n",
    progressive: "The session is holding the branch.\n",
    holds: "The session holds the branch.\n",
    missing: "The engine adds the one that is missing.\n",
    standing: "What matters is standing outside a work branch.\n",
  },
  (said) => {
    refuses(said, "Auxiliary", "perfect");
    passes(said, "Auxiliary", "simple");
    refuses(said, "Progressive", "progressive");
    for (const key of ["holds", "missing", "standing"])
      passes(said, "Progressive", key);
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
proves(
  "a modal outside the register is refused, and one inside it passes",
  {
    should: "A person should read the note.\n",
    would: "The engine would read the note.\n",
    can: "A person can read the note.\n",
    must: "The engine must read the note, and it will.\n",
  },
  (said) => {
    refuses(said, "Modal", "should");
    refuses(said, "Modal", "would");
    passes(said, "Modal", "can");
    passes(said, "Modal", "must");
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
proves(
  "a contraction and a short form are refused, and the writing out passes",
  {
    contracted: "The engine doesn't stop here.\n",
    written: "The engine does not stop here.\n",
    latin: "A duck, e.g. a mallard, stands here.\n",
    english: "A duck, for example a mallard, stands here.\n",
    etc: "Ducks, geese, etc. We saw them.\n",
    soOn: "Ducks, geese and so on. We saw them.\n",
  },
  (said) => {
    refuses(said, "Contraction", "contracted");
    passes(said, "Contraction", "written");
    refuses(said, "Latin", "latin");
    passes(said, "Latin", "english");
    refuses(said, "EtCetera", "etc");
    passes(said, "EtCetera", "soOn");
  },
);

// The engine writes a record's `why`, and a hand rewording it writes over the record. So the rules read past it, and a person's own field keeps them. [[spec/design_output/projection#what-stands-outside-a-layer]]
const TICKET = "spec/tickets/a-name.md";
const recorded = (key) =>
  at(
    [
      "---",
      "kind: [[ticket]]",
      "record:",
      "  - step: implement/change",
      `    ${key}: The hand reads \`one.js\`, \`two.js\`, \`three.js\`, \`four.js\` and \`five.js\`.`,
      "---",
      "",
      "# Ask",
      "",
      "A line of prose.",
      "",
    ].join("\n"),
    TICKET,
  );

proves(
  "the rules read past the engine's field, and hold a person's own",
  { why: recorded("why"), asks: recorded("asks"), does: recorded("does") },
  (said) => {
    passes(said, "CodeSpans", "why");
    passes(said, "Characters", "asks");
    refuses(said, "CodeSpans", "does");
  },
);

// A sentence restating the table beside it drifts from that table. [[spec/design_output/lsp#a-second-copy-draws]]
const restated = (lead, cell) =>
  `${lead}\n\n| what stands | what it does |\n|---|---|\n| ${cell} | it names the line |\n`;

proves(
  "a paragraph restating the table beside it is refused",
  {
    same: restated(
      "A door refuses a write breaking a rule, and the table says so.",
      "a door refuses a write breaking a rule",
    ),
    other: restated(
      "The door names what it reads.",
      "a door refuses a write breaking a rule",
    ),
  },
  (said) => {
    refuses(said, "RestatedTable", "same");
    passes(said, "RestatedTable", "other");
  },
);

// The tense reader stands over the rule, so a word this tree means in the present reads past it. [[spec/design_output/projection#the-grammar-rules]]
proves(
  "the past tense is refused, and the words this tree means pass",
  {
    past: "Somebody wrote the note and finished the work.\n",
    present: "Somebody writes the note and finishes the work.\n",
    skips: "The gate answers red where a test skips a case.",
    held: "The verb buys one place, and a reader read what he held.",
    bound: "The rule holds its bound, and a numbered note stands.",
    settled: "A settled question waits, and a complicated one waits longer.",
    refused: "A rule the table switched off leaves a refused write behind.",
  },
  (said) => {
    const tensed = (key) =>
      withoutFalsePast(said.text(key), said.found(key)).map((one) => one.rule);
    assert.ok(tensed("past").includes("PastTense"), "a real past tense fires");
    for (const key of ["present", "skips", "held", "bound", "settled", "refused"]) {
      const found = tensed(key);
      assert.ok(!found.includes("PastTense"), `${key} answers ${found.join(", ")}`);
    }
  },
);
