// The review door: the tool it registers, and the answer to a token nobody
// asked for.
// [[spec/design_output/review#the-tool-the-session-calls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { CALLED } from "../../.claude/skills/level0/lib/review.js";
import { ANSWERED, onAgentAnswered, SPECS, TOOLS } from "../../src/bridge/review.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

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

// The helper's spawn takes the node path off the box, so a case names its own. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the review spawns the verb on the node the box names", async () => {
  const proc = fakeProc({ "/node/bin/node": { stdout: "" } });
  const box = {
    method: "/tools",
    work: "/tools",
    node: "/node/bin/node",
    proc,
    log: { say() {} },
  };

  await TOOLS[CALLED]({ branch: "work/one" }, box);

  assert.equal(proc.ran.length, 1);
  assert.equal(proc.ran[0].argv[0], "/node/bin/node");
});
