// The voice rules, through the real Vale. A rule asserted against a stub is a
// rule nobody has run, so these cases spawn the binary and stand here.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { NOBODY } from "../../.claude/skills/level0/lib/private.js";
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
  assert.ok((await ruled(said(7))).includes("Paragraph"));
  assert.ok(!(await ruled(said(6))).includes("Paragraph"));
});

ifVale("a sentence over the word limit is refused", async () => {
  const long = `The engine ${"and the reader ".repeat(12)}meet here.`;
  assert.ok((await ruled(long)).includes("Sentence"));
});

ifVale("the past tense is refused, and the words this tree means pass", async () => {
  assert.ok(
    (await ruled("Somebody wrote the note and finished the work.")).includes(
      "PastTense",
    ),
    "a real past tense fires",
  );

  const quiet = async (text) => {
    const found = await ruled(text);
    assert.ok(!found.includes("PastTense"), `${text} answers ${found.join(", ")}`);
  };

  await quiet("The gate answers red where a test skips a case.");
  await quiet("The verb buys one place, and a reader read what he held.");
  await quiet("The rule holds its bound, and a numbered note stands.");
  await quiet("A settled question waits, and a complicated one waits longer.");
  await quiet("A rule the table switched off leaves a refused write behind.");
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
  assert.ok(said.includes("Latin"));
});

const answered = async (text) => {
  const said = await lintText(text, "answer.md", { run, bin });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((f) => f.rule);
};

ifVale(
  "a heading opens a fresh prose budget, and a third paragraph breaks it",
  async () => {
    const two = "# One\n\nA paragraph.\n\nA second paragraph.\n";
    assert.ok(!(await answered(two)).includes("ShapeAnswer"));

    const across = `${two}\n# Two\n\nA paragraph.\n\nA second paragraph.\n`;
    assert.ok(!(await answered(across)).includes("ShapeAnswer"));

    const three = `${two}\nA third paragraph.\n`;
    assert.ok((await answered(three)).includes("ShapeAnswer"));
  },
);

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const SECRETS = ["/home", "fnordwick", "secrets"].join("/");
const CALLED = ["+49 30", "1234 5678"].join(" ");

// [[spec/design_output/private#the-shapes]]
ifVale("the shapes rule refuses an address, a number, a date and a home path", async () => {
  for (const said of [
    "Reach the owner at somebody@example.com when the box stalls.",
    `Call ${CALLED} about it, and say what stalls.`,
    "Measured on 2026-09-10 against client 2.1.267, on a cloud box.",
    `The probe writes under ${SECRETS} and reads it back.`,
    "A box answers C:\\Users\\fnordwick\\Desktop as the home folder there.",
  ]) {
    assert.ok((await ruled(said)).includes("Private"), said);
  }
});

ifVale("a nobody user, a version and an example pass the shapes rule", async () => {
  for (const said of [
    "A cloud box writes under /home/user, and a fixture writes /Users/one.",
    "A runner writes under /home/runner, and an agent under /home/claude.",
    "Client 2.1.267 stands the same way, and the number 1024 passes.",
    `    the indented example: 2026-09-08 and ${SECRETS}\n`,
  ]) {
    assert.ok(!(await ruled(said)).includes("Private"), said);
  }
});

test("the shapes rule and the commit door pass one list of nobody users", () => {
  const rule = files.read(join(root, "spec/config/styles/VoiceVale/Private.yml"));
  const listed = /nobody := \[([^\]]*)\]/.exec(rule);
  assert.ok(listed, "the rule names its nobody users");
  const names = listed[1].split(",").map((one) => one.trim().replace(/^"|"$/g, ""));
  assert.deepEqual(names.sort(), [...NOBODY].sort());
});
