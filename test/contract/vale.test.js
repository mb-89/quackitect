// The voice rules, through the real Vale. A rule asserted against a stub is a
// rule nobody has run, so these cases spawn the binary and stand here.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { lintText, valeBin } from "../../.claude/skills/level0/lib/vale.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = join(root, valeBin(process.platform));
const ifVale = files.exists(bin) ? test : skip;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const ruled = async (text) => {
  const said = await lintText(text, "notes.md", { run, bin });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((f) => f.rule);
};

ifVale(
  "a shouted lead is refused and an acronym inside a sentence passes",
  async () => {
    assert.ok(
      (await ruled("THIS IS THE SHOUTED PART, and it follows.")).includes(
        "ShoutedLead",
      ),
    );
    assert.ok(
      !(await ruled("The engine reads SQLite and answers JSON.")).includes(
        "ShoutedLead",
      ),
    );
  },
);

ifVale("antithesis is refused", async () => {
  assert.ok((await ruled("It is a door rather than a window.")).includes("Antithesis"));
});

ifVale("the passive is refused and the active passes", async () => {
  assert.ok((await ruled("The file was written by the engine.")).includes("Passive"));
  assert.ok(!(await ruled("The engine writes the file.")).includes("Passive"));
});

ifVale("a paragraph over six sentences is refused and six pass", async () => {
  const said = (n) =>
    Array.from({ length: n }, (_, i) => `Sentence number ${i} stands here.`).join(" ");
  assert.ok((await ruled(said(7))).includes("LongParagraph"));
  assert.ok(!(await ruled(said(6))).includes("LongParagraph"));
});

ifVale("a sentence over the word limit is refused", async () => {
  const long = `The engine ${"and the reader ".repeat(12)}meet here.`;
  assert.ok((await ruled(long)).includes("LongSentence"));
});

ifVale("a table and a list are not paragraphs", async () => {
  assert.deepEqual(await ruled("| a | b |\n| - | - |\n"), []);
  assert.deepEqual(await ruled("- one\n- two\n"), []);
});

ifVale("fenced code carries none of these rules", async () => {
  assert.deepEqual(
    await ruled("```\nTHIS IS SHOUTED CODE, and it is left alone.\n```\n"),
    [],
  );
});

ifVale("a contraction and a Latin short form are refused", async () => {
  const said = await ruled("The engine doesn't stop, e.g. here.");
  assert.ok(said.includes("Contraction"));
  assert.ok(said.includes("LatinAbbreviation"));
});

const answered = async (text) => {
  const said = await lintText(text, "answer.md", { run, bin });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((f) => f.rule);
};

ifVale("a heading opens a fresh prose budget, and a third paragraph breaks it", async () => {
  const two = "# One\n\nA paragraph.\n\nA second paragraph.\n";
  assert.ok(!(await answered(two)).includes("PreferStructureAnswer"));

  const across = `${two}\n# Two\n\nA paragraph.\n\nA second paragraph.\n`;
  assert.ok(!(await answered(across)).includes("PreferStructureAnswer"));

  const three = `${two}\nA third paragraph.\n`;
  assert.ok((await answered(three)).includes("PreferStructureAnswer"));
});
