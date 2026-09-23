// The review door: the tool it registers, and the answer to a token nobody
// asked for.
// [[spec/design_output/review#the-tool-the-session-calls]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { CALLED } from "../../.claude/skills/level0/lib/review.js";
import { ANSWERED, onAgentAnswered, SPECS, TOOLS } from "../../src/bridge/review.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
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

// A restart hands the box over bare, and the reader still takes the standing layer. [[spec/design_output/level0#a-restart-fills-the-box]]
test("a review on a box a restart hands over bare reads the guidance into the prompt", async () => {
  const box = {
    disk: fakeDisk({
      "/tools/spec/guidance/voice.md":
        "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n",
    }),
    method: "/tools",
    work: "/tools",
    env: {},
    node: "/node/bin/node",
    proc: fakeProc({ "/node/bin/node": { stdout: '{"branch":"work/one"}\n' } }),
    clock: { now: () => new Date(0) },
    log: { say() {} },
  };

  const said = await TOOLS[CALLED]({ branch: "work/one" }, box);

  assert.match(said.spawn.prompt, /Say what is\./);
  assert.ok(box.guidance, "the accessor fills the box");
});
