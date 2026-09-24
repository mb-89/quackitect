// The Agent door over a fake box: a call waiting on its helper refuses and
// names the background road, and every other Agent call passes.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onAgent, tiersText } from "../../src/bridge/agent.js";
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

const TIERED = { helper: { find: "haiku", change: "sonnet", decide: "opus" } };

function tiered(config = TIERED) {
  return {
    ...box(),
    disk: fakeDisk({ "/tree/spec/config/level0.json": JSON.stringify(config) }),
    work: "/tree",
    method: "/tree",
  };
}

// [[spec/design_output/level0#a-spawn-names-its-tier]]
test("an Agent call naming no model refuses, and names each tier with its model", () => {
  const said = onAgent({ tool: "Agent", run_in_background: true }, tiered());
  const deny = said?.result?.deny ?? "";
  assert.match(deny, /names no model/);
  assert.match(deny, /find takes `haiku`/);
  assert.match(deny, /change takes `sonnet`/);
  assert.match(deny, /decide takes `opus`/);
});

test("an Agent call naming a tier's model passes, and one naming a model of no tier refuses", () => {
  for (const model of ["haiku", "sonnet", "opus"]) {
    assert.deepEqual(onAgent({ tool: "Agent", model }, tiered()), { pass: true });
  }
  const off = { helper: { find: "sonnet", change: "opus", decide: "opus" } };
  assert.match(onAgent({ tool: "Agent", model: "haiku" }, tiered(off)).result.deny, /a model of no tier/);
});

test("the config flips a tier, and the text follows it", () => {
  const flipped = { helper: { find: "haiku", change: "opus", decide: "opus" } };
  assert.match(tiersText(tiered(flipped)), /change takes `opus`/);
});

test("a tree whose config names no tier keeps the model door off", () => {
  assert.deepEqual(onAgent({ tool: "Agent" }, tiered({})), { pass: true });
  assert.equal(tiersText(tiered({})), "");
});

test("a helper's Agent call naming no model meets the same refusal", () => {
  const said = onAgent({ tool: "Agent", agentId: "a1" }, tiered());
  assert.match(said?.result?.deny ?? "", /names no model/);
});
