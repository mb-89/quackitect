// The pull tool's pure half. The argv it hands the shell and the question it
// puts to the judge, read with no harness standing.
// [[spec/design_output/pull#the-checks]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  judgeAsk,
  judgeRefusal,
  PULL_CALL,
  pullSpec,
  spawnPromptIn,
} from "../../.claude/skills/level1/lib/pull.js";
// The whole module, so a name the wrapper answers nowhere yet fails an assertion. [[spec/tickets/the-judge-reads-answer-rules]]
import * as level1 from "../../.claude/skills/level1/lib/pull.js";
import { pullArgvOf } from "../../src/scripts/pull-tool.js";

// The rules a leaf hands the judge, each label naming one rule. [[spec/tickets/the-judge-reads-answer-rules]]
const RULES = [
  {
    label: "voice-1",
    note: "spec/guidance/voice",
    number: 1,
    rule: "Say what is.",
  },
  {
    label: "voice-3",
    note: "spec/guidance/voice",
    number: 3,
    rule: "Put the bottom line first.",
  },
];

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the wrapper reads the prompt out of a spawn answer, and nothing out of any other", () => {
  const said =
    "spawn\n  a-child at design/review waits for a hand other than box 1.\n  Spawn a hand.\n\nYou are a hand of your own, named helper-2.\n1. Run it.";
  assert.equal(
    spawnPromptIn(said),
    "You are a hand of your own, named helper-2.\n1. Run it.",
  );
  assert.equal(spawnPromptIn("work  a-child at design/draft\n\nprose"), "");
  assert.equal(spawnPromptIn(""), "");
});

// [[spec/design_output/pull#the-hand-out]]
test("the tool's input reads into the same words a person types", () => {
  const tool = (said, ...more) =>
    pullArgvOf(["pull", "--tool", JSON.stringify(said), ...more]);
  assert.deepEqual(tool({}), ["pull"]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "fail", reason: "thin" }), [
    "pull",
    "a-child",
    "--fail",
    "thin",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "became", reason: "a-group" }), [
    "pull",
    "a-child",
    "--became",
    "a-group",
  ]);
  assert.deepEqual(
    tool({ ticket: "a-child", verdict: "pass", fields: { approach: "x" } }),
    ["pull", "a-child", "--pass", "--fields", '{"approach":"x"}'],
  );
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }, "--judge"), [
    "pull",
    "a-child",
    "--judge",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "a-child", "--pass"]), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "--tool", "not json"]), ["pull"]);
  assert.equal(PULL_CALL, "mcp__level1__pull");
  assert.equal(pullSpec().name, "pull");
  assert.deepEqual(pullSpec().inputSchema.properties.verdict.enum, [
    "pass",
    "fail",
    "became",
  ]);
});

// [[spec/design_output/pull#the-checks]]
test("the judge's question names each rule by its label and carries the evidence whole", () => {
  const ask = judgeAsk("The approach.\nchecked:\n- one", RULES);
  assert.match(ask, /voice-1: Say what is\.\nvoice-3: Put the bottom line first\./);
  assert.match(ask, /Evidence:\nThe approach\.\nchecked:\n- one$/);
  assert.match(
    judgeRefusal("the judge answers breaks over design/draft"),
    /^refused\n/,
  );
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("the labels the judge picks from open on follows, one label a rule after it", () => {
  assert.equal(typeof level1.judgeLabels, "function", "the wrapper answers judgeLabels");
  assert.deepEqual(level1.judgeLabels(RULES), ["follows", "voice-1", "voice-3"]);
  assert.deepEqual(level1.judgeLabels([]), ["follows"]);
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("a label reads back to the note, the number and the rule's own line", () => {
  assert.equal(typeof level1.ruleBroken, "function", "the wrapper answers ruleBroken");
  const said = level1.ruleBroken("voice-3", RULES);
  assert.match(said, /spec\/guidance\/voice/, "the refusal names the note");
  assert.match(said, /rule 3/, "the refusal names the number");
  assert.match(said, /Put the bottom line first\./, "the refusal names the line");
});

// [[spec/tickets/the-judge-reads-answer-rules]]
test("a label outside the set reads as follows, so a judge naming nothing refuses nothing", () => {
  assert.equal(typeof level1.ruleBroken, "function", "the wrapper answers ruleBroken");
  assert.equal(level1.ruleBroken("follows", RULES), "");
  assert.equal(level1.ruleBroken("voice-9", RULES), "");
  assert.equal(level1.ruleBroken("", RULES), "");
});
