// The structure rules and the judge. The judge takes a classifier of its own,
// so these tests spend no model call.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { proseRuns, tooMuchProse } from "../lib/shape.mjs";
import { judgeOf, spansIn } from "../lib/judge.mjs";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const config = JSON.parse(readFileSync(join(root, "spec", "config", "level0.json"), "utf8"));

const para = (n) => Array.from({ length: n }, (_, i) => `Paragraph number ${i} stands here and says a thing.`).join("\n\n");

test("paragraphs running together are counted as one run", () => {
  assert.deepEqual(proseRuns(para(3)), [{ line: 1, paragraphs: 3 }]);
});

test("a list, a table, a heading and a fence each break a run", () => {
  for (const breaker of ["- one\n- two", "| a | b |", "## A heading", "```\ncode\n```"]) {
    const text = `First paragraph here.\n\n${breaker}\n\nSecond paragraph here.\n`;
    const runs = proseRuns(text);
    assert.equal(runs.length, 2, `${breaker.split("\n")[0]} breaks the run`);
  }
});

test("an answer holds one paragraph and a document holds three", () => {
  assert.equal(tooMuchProse(para(2), 1).length, 1, "two paragraphs break an answer");
  assert.equal(tooMuchProse(para(1), 1).length, 0, "one paragraph passes");
  assert.equal(tooMuchProse(para(3), 3).length, 0, "three paragraphs pass a document");
  assert.equal(tooMuchProse(para(4), 3).length, 1, "four break a document");
});

test("the finding names the count and the limit", () => {
  const [one] = tooMuchProse(para(4), 3);
  assert.equal(one.rule, "PreferStructure");
  assert.match(one.message, /4 paragraphs run together/);
  assert.match(one.message, /Hold prose to 3/);
});

test("a span is a paragraph, and structure carries none", () => {
  const spans = spansIn("A paragraph long enough to be worth a call from the judge here.\n\n- a list item\n\n| a | b |\n");
  assert.equal(spans.length, 1);
  assert.match(spans[0].text, /^A paragraph long enough/);
});

test("a short line costs no model call", () => {
  assert.deepEqual(spansIn("Too short.\n"), []);
});

test("the judge refuses on its refusing label and passes on the other", async () => {
  const judge = judgeOf(config);
  const long = "This explains where the thing came from and what somebody once tried before now.";

  const asBackground = async () => "background";
  const found = await judge.run(long, asBackground);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Actionable");
  assert.match(found[0].message, /spec\/rationales/);

  const asActionable = async () => "actionable";
  assert.deepEqual(await judge.run(long, asActionable), []);
});

test("a model naming no label passes the text", async () => {
  const judge = judgeOf(config);
  const long = "This explains where the thing came from and what somebody once tried before now.";
  assert.deepEqual(await judge.run(long, async () => undefined), []);
  assert.deepEqual(await judge.run(long, async () => { throw new Error("no model"); }), []);
});

test("the judge is off when the config says so", () => {
  const judge = judgeOf({ judge: { enabled: false, rules: config.judge.rules } });
  assert.equal(judge.reads(), false);
});

test("the judge reads every warmup write, then samples, and a breach resets it", () => {
  const judge = judgeOf(config);
  const warmup = config.judge.warmupWrites;

  for (let i = 0; i < warmup; i++) {
    assert.equal(judge.reads(), true, `write ${i + 1} is inside the warmup`);
    judge.sawClean();
  }
  const after = [judge.reads(), judge.reads(), judge.reads()];
  assert.ok(after.includes(false), "it stops reading every write once the session proves itself");

  judge.sawBreach();
  assert.equal(judge.reads(), true, "a breach puts it back to reading everything");
});
