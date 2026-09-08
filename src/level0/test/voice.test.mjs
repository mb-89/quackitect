// The voice rules, tested. Run with: ./RUNME.sh test
//
// Two kinds of test are here. The parsing and the exemption rule are pure and
// need nothing installed. The rule cases drive the real Vale, because a rule
// asserted against a stub is a rule nobody has run.

import { test, skip } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { lintText, fromJson, unreasoned, valeBin, CONFIG } from "../lib/vale.mjs";
import { refusal, taught } from "../lib/refuse.mjs";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const bin = join(root, valeBin(process.platform));
const haveVale = existsSync(bin);

const run = async (argv, init = {}) => {
  const ran = spawnSync(argv[0], argv.slice(1), {
    cwd: init.cwd ?? root, input: init.stdin ?? "", encoding: "utf8", shell: false,
  });
  if (ran.error) throw ran.error;
  return { exitCode: ran.status ?? 1, stdout: ran.stdout ?? "", stderr: ran.stderr ?? "" };
};

const ruled = async (text) => {
  const said = await lintText(text, "notes.md", { run, bin });
  assert.ok(said.ran, "vale ran: " + said.why);
  return said.found.map((f) => f.rule);
};

test("a finding is read out of Vale's JSON", () => {
  const found = fromJson(JSON.stringify({
    "notes.md": [{
      Check: "VoiceQuackitect.Antithesis", Line: 3, Span: [14, 24],
      Match: "rather than", Message: "Say what is.", Severity: "error",
      Action: { Name: "" },
    }],
  }));
  assert.deepEqual(found, [{
    file: "notes.md",
    rule: "Antithesis", line: 3, column: 14, said: "rather than",
    message: "Say what is.", severity: "error", fixable: false,
  }]);
});

test("output that is not JSON answers no finding", () => {
  assert.deepEqual(fromJson("vale: something went wrong"), []);
});

test("an exemption naming a reason passes, and one naming none is refused", () => {
  const with_ = "<!-- because: the phrase is being quoted -->\n<!-- vale VoiceQuackitect.Antithesis = NO -->\nIt is a door rather than a window.";
  assert.deepEqual(unreasoned(with_), []);

  const without = "<!-- vale VoiceQuackitect.Antithesis = NO -->\nIt is a door rather than a window.";
  const found = unreasoned(without);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "ExemptionCarriesAReason");
  assert.equal(found[0].line, 1);
});

test("a linter that cannot run degrades the call", async () => {
  const said = await lintText("anything", "notes.md", {
    run: async () => { throw new Error("vale is not here"); },
  });
  assert.equal(said.ran, false);
  assert.deepEqual(said.found, []);
});

test("the refusal asks the writer to hold the rule for the rest of the turn", () => {
  const said = taught([{ rule: "Antithesis" }, { rule: "ShoutedLead" }]);
  assert.match(said, /Hold Antithesis and ShoutedLead for the rest of this turn/);
});

test("a refusal names the file, the line, the phrase and the rule", () => {
  const said = refusal("spec/notes.md", [{
    rule: "Antithesis", line: 3, column: 14, said: "rather than",
    message: "Say what is.", severity: "error",
  }]);
  assert.match(said, /spec\/notes\.md:3:14 {2}Antithesis/);
  assert.match(said, /wrote: rather than/);
  assert.match(said, /Say what is\./);
});

// From here the real Vale runs. A rule asserted against a stub is a rule
// nobody has run, so these skip rather than pretend when it is missing.
const ifVale = haveVale ? test : skip;

ifVale("a shouted lead is refused and an acronym inside a sentence passes", async () => {
  assert.ok((await ruled("THIS IS THE SHOUTED PART, and it follows.")).includes("ShoutedLead"));
  assert.ok(!(await ruled("The engine reads SQLite and answers JSON.")).includes("ShoutedLead"));
});

ifVale("antithesis is refused", async () => {
  assert.ok((await ruled("It is a door rather than a window.")).includes("Antithesis"));
});

ifVale("the passive is refused and the active passes", async () => {
  assert.ok((await ruled("The file was written by the engine.")).includes("Passive"));
  assert.ok(!(await ruled("The engine writes the file.")).includes("Passive"));
});

ifVale("a paragraph over six sentences is refused and six pass", async () => {
  const said = (n) => Array.from({ length: n }, (_, i) => `Sentence number ${i} stands here.`).join(" ");
  assert.ok((await ruled(said(7))).includes("LongParagraph"));
  assert.ok(!(await ruled(said(6))).includes("LongParagraph"));
});

ifVale("a sentence over the word limit is refused", async () => {
  const long = "The engine " + "and the reader ".repeat(12) + "meet here.";
  assert.ok((await ruled(long)).includes("LongSentence"));
});

ifVale("a table and a list are not paragraphs", async () => {
  assert.deepEqual(await ruled("| a | b |\n| - | - |\n"), []);
  assert.deepEqual(await ruled("- one\n- two\n"), []);
});

ifVale("fenced code carries none of these rules", async () => {
  assert.deepEqual(await ruled("```\nTHIS IS SHOUTED CODE, and it is left alone.\n```\n"), []);
});

ifVale("a contraction and a Latin short form are refused", async () => {
  const said = await ruled("The engine doesn't stop, e.g. here.");
  assert.ok(said.includes("Contraction"));
  assert.ok(said.includes("LatinAbbreviation"));
});
