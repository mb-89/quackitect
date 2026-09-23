// The Agent door over a fake box: a call waiting on its helper refuses and
// names the background road, and every other Agent call passes.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onAgent } from "../../src/bridge/agent.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

function box() {
  const said = [];
  return { said, log: { say: (...row) => said.push(row) } };
}

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
test("an Agent call with run_in_background false refuses, and names the background road", () => {
  const it = box();
  const said = onAgent({ tool: "Agent", run_in_background: false }, it);
  assert.match(said?.result?.deny ?? "", /run_in_background: false/, "the refusal names the field");
  assert.match(said?.result?.deny ?? "", /run_in_background: true/, "and names the background road");
});

test("an Agent call without run_in_background passes, and one in the background passes", () => {
  assert.deepEqual(onAgent({ tool: "Agent" }, box()), { pass: true });
  assert.deepEqual(onAgent({ tool: "Agent", run_in_background: true }, box()), { pass: true });
});

// A helper waiting on its own helper blocks the same way. [[spec/design_output/level0#a-helper-ends-no-turn]]
test("a helper's Agent call with run_in_background false meets the same refusal", () => {
  const said = onAgent({ tool: "Agent", agentId: "a1", run_in_background: false }, box());
  assert.match(said?.result?.deny ?? "", /run_in_background: true/);
});

// [[spec/design_output/level0#an-agent-call-runs-behind]]
test("the server hands an Agent call to the Agent door", async () => {
  const box = boxOf("/tree", "/tree", {
    disk: fakeDisk({}),
    clock: fakeClock(),
    log: fakeLog(),
    proc: fakeProc({}),
    index: { dead: () => "", fault: () => "", warm: () => ({ warmed: false }) },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
  const said = await decide({ event: "tool.call", e: { tool: "Agent", run_in_background: false } }, box);
  assert.match(said?.result?.deny ?? "", /run_in_background: true/);
});
