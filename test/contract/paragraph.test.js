// Every rule the paragraph schema projects, through the real Vale. A rule
// asserted against a stub is a rule nobody has run, so each case here feeds the
// binary something the rule refuses and something it passes.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const ruled = async (text, where = "notes.md") => {
  const said = await lintText(text, where, { run, bin });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((one) => one.rule);
};

const refuses = async (rule, text, where) => {
  const found = await ruled(text, where);
  assert.ok(found.includes(rule), `${rule} fires: ${found.join(", ") || "nothing"}`);
};

const passes = async (rule, text, where) => {
  const found = await ruled(text, where);
  assert.ok(!found.includes(rule), `${rule} stays quiet: ${found.join(", ")}`);
};

// [[spec/design_output/projection#the-second-target]]
ifVale("a character outside the set is refused, and a code span passes", async () => {
  await refuses(
    "Characters",
    "The engine reads it, and the reader waits; so it goes.\n",
  );
  await passes("Characters", "The engine reads it, and the reader waits.\n");
  await passes("Characters", "The engine reads `a; b` and the reader waits.\n");
  await passes("Characters", "```\nThe engine; the reader.\n```\n");
  await passes("Characters", "The TL;DR list opens the answer.\n");
  await passes("Characters", "The door reads spec/config/styles and answers.\n");
});

// [[spec/design_output/projection#the-second-target]]
ifVale("a long heading, a second title and a long lead are refused", async () => {
  await refuses("Markup", "# This heading holds far too many words here\n");
  await passes("Markup", "# A short heading\n");

  await refuses("Markup", "# A heading: two things\n");
  await passes("Markup", "# One thing\n");

  await refuses("Markup", "- **A strong lead running far too long** the rest.\n");
  await passes("Markup", "- **A short lead** the rest.\n");
});

// [[spec/design_output/projection#a-layer-writes-two-files]]
ifVale("a run of four paragraphs is refused, and three pass", async () => {
  const said = (n) =>
    Array.from({ length: n }, (_, i) => `Paragraph number ${i} stands here.`).join(
      "\n\n",
    );
  await refuses("Shape", `${said(4)}\n`);
  await passes("Shape", `${said(3)}\n`);
});

// [[spec/design_output/projection#a-layer-writes-two-files]]
ifVale(
  "the answer register takes the tighter run, and prose keeps its own",
  async () => {
    const said = (n) =>
      Array.from({ length: n }, (_, i) => `Paragraph number ${i} stands here.`).join(
        "\n\n",
      );
    await refuses("ShapeAnswer", `${said(3)}\n`, "answer.md");
    await passes("ShapeAnswer", `${said(2)}\n`, "answer.md");
    await passes("ShapeAnswer", `${said(3)}\n`);
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
ifVale(
  "a paragraph over the sentence cap is refused, in prose and in an answer",
  async () => {
    const said = (n) =>
      Array.from({ length: n }, (_, i) => `Sentence number ${i} stands here.`).join(
        " ",
      );
    await refuses("Paragraph", `${said(7)}\n`);
    await passes("Paragraph", `${said(6)}\n`);

    await refuses("ParagraphAnswer", `${said(4)}\n`, "answer.md");
    await passes("ParagraphAnswer", `${said(3)}\n`, "answer.md");
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
ifVale(
  "a sentence over the word cap is refused, and a list item takes less",
  async () => {
    const long = `The engine ${"and the reader ".repeat(12)}meet here.`;
    await refuses("Sentence", `${long}\n`);
    await passes("Sentence", "The engine and the reader meet here.\n");

    const item = `- The engine ${"and the reader ".repeat(7)}meet here.`;
    await refuses("ListItem", `${item}\n`);
    await passes("ListItem", "- The engine and the reader meet here.\n");
  },
);

// [[spec/design_output/projection#a-layer-writes-two-files]]
ifVale(
  "a sentence over the code span cap is refused, and a table row passes",
  async () => {
    await refuses("CodeSpans", "It reads `a`, `b`, `c`, `d` and `e` here.\n");
    await passes("CodeSpans", "It reads `a`, `b`, `c` and `d` here.\n");
    await passes(
      "CodeSpans",
      "| `a` | `b` | `c` | `d` | `e` |\n| - | - | - | - | - |\n",
    );
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
ifVale(
  "the perfect and the progressive are refused, and the simple tense passes",
  async () => {
    await refuses("Auxiliary", "The engine has written the file.\n");
    await passes("Auxiliary", "The engine writes the file.\n");

    await refuses("Progressive", "The session is holding the branch.\n");
    await passes("Progressive", "The session holds the branch.\n");

    await passes("Progressive", "The engine adds the one that is missing.\n");
    await passes("Progressive", "What matters is standing outside a work branch.\n");
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
ifVale(
  "a modal outside the register is refused, and one inside it passes",
  async () => {
    await refuses("Modal", "A person should read the note.\n");
    await refuses("Modal", "The engine would read the note.\n");
    await passes("Modal", "A person can read the note.\n");
    await passes("Modal", "The engine must read the note, and it will.\n");
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
ifVale(
  "a contraction and a short form are refused, and the writing out passes",
  async () => {
    await refuses("Contraction", "The engine doesn't stop here.\n");
    await passes("Contraction", "The engine does not stop here.\n");

    await refuses("Latin", "A duck, e.g. a mallard, stands here.\n");
    await passes("Latin", "A duck, for example a mallard, stands here.\n");

    await refuses("EtCetera", "Ducks, geese, etc. We saw them.\n");
    await passes("EtCetera", "Ducks, geese and so on. We saw them.\n");
  },
);

// [[spec/design_output/projection#the-grammar-rules]]
ifVale(
  "the past tense is refused, and a word the schema leaves standing passes",
  async () => {
    await refuses("PastTense", "Somebody wrote the note and finished the work.\n");
    await passes("PastTense", "Somebody writes the note and finishes the work.\n");
    await passes(
      "PastTense",
      "The rule holds its bound, and a numbered note stands.\n",
    );
  },
);
