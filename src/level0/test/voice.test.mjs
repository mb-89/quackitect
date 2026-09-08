// The voice rules, tested. Run with: node --test src/level0/test/
//
// Every case here is one a work token named as decidable. The judged rules need
// a model, so their test hands the checker a classifier of its own.

import { test } from "node:test";
import assert from "node:assert/strict";

import { sentencesIn, paragraphsIn } from "../lib/text.mjs";
import { check, judge, applyFixes } from "../lib/check.mjs";
import { taught } from "../lib/refuse.mjs";

const ruled = (found) => found.map((f) => f.rule);

test("a full stop inside a word ends no sentence", () => {
  assert.equal(sentencesIn("A file named .md and a call to $.model.classify.").length, 1);
  assert.equal(sentencesIn("It waits... then it answers.").length, 1);
  assert.equal(sentencesIn("Version 2.1.263 carries the runtime.").length, 1);
});

test("a full stop before a space and a capital ends one", () => {
  assert.equal(sentencesIn("The engine writes the file. A reader sees it.").length, 2);
});

test("a table and a list are not paragraphs", () => {
  assert.equal(paragraphsIn("| a | b |\n| - | - |").length, 0);
  assert.equal(paragraphsIn("- one\n- two").length, 0);
  assert.equal(paragraphsIn("# A heading").length, 0);
});

test("a shouted lead is refused and an acronym inside a sentence passes", () => {
  assert.ok(ruled(check("THIS IS THE SHOUTED PART, and then the prose.")).includes("shouted-lead"));
  assert.ok(!ruled(check("The engine reads SQLite and answers JSON.")).includes("shouted-lead"));
});

test("antithesis is refused and names the phrase", () => {
  const found = check("It is a door rather than a window.");
  assert.ok(ruled(found).includes("antithesis"));
  assert.equal(found.find((f) => f.rule === "antithesis").said, "rather than");
});

test("a paragraph over six sentences is refused and the count is named", () => {
  const long = Array.from({ length: 7 }, (_, i) => `Sentence number ${i} stands here.`).join(" ");
  const found = check(long);
  const hit = found.find((f) => f.rule === "long-paragraph");
  assert.ok(hit, "seven sentences are refused");
  assert.match(hit.instead, /7 sentences/);

  const six = Array.from({ length: 6 }, (_, i) => `Sentence number ${i} stands here.`).join(" ");
  assert.ok(!ruled(check(six)).includes("long-paragraph"), "six sentences pass");
});

test("a sentence over the word limit is refused", () => {
  const long = "The engine " + "and the reader ".repeat(12) + "meet here.";
  assert.ok(ruled(check(long)).includes("long-sentence"));
});

test("fenced code carries none of these rules", () => {
  const text = "```\nTHIS IS SHOUTED CODE, and it is left alone.\n```\n";
  assert.deepEqual(check(text), []);
});

test("an exemption naming a reason switches its own rule off and no other", () => {
  const with_ = "<!-- voice antithesis = NO: the phrase is quoted here -->\nIt is a door rather than a window.";
  assert.ok(!ruled(check(with_)).includes("antithesis"));

  const both = "<!-- voice antithesis = NO: the phrase is quoted here -->\nTHIS IS SHOUTED, and it is a door rather than a window.";
  const found = ruled(check(both));
  assert.ok(!found.includes("antithesis"), "the named rule is off");
  assert.ok(found.includes("shouted-lead"), "the other rule still bites");
});

test("an exemption naming no reason is refused", () => {
  const found = check("<!-- voice antithesis = NO -->\nIt is a door rather than a window.");
  assert.ok(ruled(found).includes("exemption-carries-a-reason"));
});

test("format fixes what a program can fix and changes nothing on a second run", () => {
  const before = "THIS IS THE SHOUTED PART, and it doesn't stop, e.g. here.";
  const once = applyFixes(before);
  assert.ok(!/THIS IS THE SHOUTED PART/.test(once), "the lead is sentence-cased");
  assert.ok(/does not/.test(once), "the contraction is expanded");
  assert.ok(/for example/.test(once), "the Latin short form is written out");
  assert.equal(applyFixes(once), once, "a second run changes nothing");
});

test("format leaves fenced code untouched", () => {
  const text = "```\nit doesn't change, e.g. here\n```";
  assert.equal(applyFixes(text), text);
});

test("the refusal asks the writer to hold the rule for the rest of the turn", () => {
  const said = taught([{ rule: "antithesis" }, { rule: "shouted-lead" }]);
  assert.match(said, /Hold antithesis and shouted-lead for the rest of this turn/);
});

test("the judge refuses a passive sentence and passes an active one", async () => {
  const classify = async (asked) => (/was written by/.test(asked) ? "passive" : "active");
  const found = await judge("The file was written by the engine.", classify);
  assert.deepEqual(ruled(found), ["passive"]);

  const clean = await judge("The engine writes the file.", classify);
  assert.deepEqual(clean, []);
});

test("a classifier that answers nothing writes the text", async () => {
  const found = await judge("The file was written by the engine.", async () => undefined);
  assert.deepEqual(found, []);
});

test("a classifier that throws writes the text", async () => {
  const found = await judge("The file was written by the engine.", async () => {
    throw new Error("the model is unreachable");
  });
  assert.deepEqual(found, []);
});
