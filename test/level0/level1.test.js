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
import { pullArgvOf } from "../../src/scripts/pull-tool.js";

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
test("the judge's question carries every rule numbered and the evidence whole", () => {
  const ask = judgeAsk("The approach.\nchecked:\n- one", [
    "Say what is.",
    "Put the bottom line first.",
  ]);
  assert.match(ask, /1\. Say what is\.\n2\. Put the bottom line first\./);
  assert.match(ask, /Evidence:\nThe approach\.\nchecked:\n- one$/);
  assert.match(
    judgeRefusal("the judge answers breaks over design/draft"),
    /^refused\n/,
  );
});
