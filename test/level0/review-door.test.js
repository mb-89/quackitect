// The review door: the tool it registers, and the answer to a token nobody
// asked for.
// [[spec/design_output/review#the-tool-the-session-calls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { CALLED } from "../../.claude/skills/level0/lib/review.js";
import { ANSWERED, onAgentAnswered, SPECS, TOOLS } from "../../src/bridge/review.js";

test("the door registers the review tool the session calls", () => {
  assert.deepEqual(Object.keys(TOOLS), [CALLED]);
  assert.equal(typeof TOOLS[CALLED], "function");
  assert.equal(SPECS()[0].name, CALLED.replace("mcp__level0__", ""));
});

test("the event the reader answers under carries the agent", () => {
  assert.equal(ANSWERED, "agent.answered");
});

test("a token nobody asked for comes back said", () => {
  const said = onAgentAnswered({ token: "review-1" }, { reviews: new Map() });

  assert.match(said.result.result, /nobody asked for/);
});
