// The cloud ask door: a cloud box meets a refusal naming the question ticket
// where it asks the owner, and a desk asks as it always does.
// [[spec/tickets/cloud-boxes-ask-nobody]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { holdsCloudAsk } from "../../src/bridge/cloud-ask.js";

const ASK = "AskUserQuestion";

function boxOn(cloud) {
  const lines = [];
  return { cloud, env: {}, lines, log: { say: (...said) => lines.push(said) } };
}

test("a cloud box refuses AskUserQuestion, and the refusal names the question ticket", () => {
  const box = boxOn(true);
  const deny = holdsCloudAsk({ tool: ASK }, box)?.result?.deny ?? "";
  assert.match(deny, /--process=question/);
  assert.match(deny, /\.\/RUNME\.sh mint ticket/);
  assert.match(deny, /push/);
  assert.match(deny, /spec\/guidance\/cloud\/cloud/);
  assert.equal(box.lines.length, 1, "the refusal writes one log line");
});

test("a desk lets AskUserQuestion pass", () => {
  assert.equal(holdsCloudAsk({ tool: ASK }, boxOn(false)), null);
});

test("a cloud box lets every other tool pass this door", () => {
  assert.equal(holdsCloudAsk({ tool: "Bash" }, boxOn(true)), null);
  assert.equal(holdsCloudAsk({ tool: "mcp__level0__report" }, boxOn(true)), null);
});
