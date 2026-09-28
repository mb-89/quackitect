// The cloud ask door: a cloud box meets a refusal naming the question ticket
// where it asks the owner, and a desk asks as it always does.
// [[spec/tickets/cloud-boxes-ask-nobody]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ASKS_NOBODY, holdsCloudAsk } from "../../src/bridge/cloud-ask.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ASK = "AskUserQuestion";

function boxOn(cloud) {
  const lines = [];
  return { cloud, env: {}, lines, log: { say: (...said) => lines.push(said) } };
}

test("a cloud box refuses AskUserQuestion, and the refusal names the question ticket", () => {
  const box = boxOn(true);
  const deny = holdsCloudAsk({ tool: ASK }, box)?.result?.deny ?? "";
  assert.match(deny, /--process=person/);
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

test("the server hands a cloud box's AskUserQuestion to the cloud ask door", async () => {
  const box = boxOf("/tree", "/tree", {
    disk: fakeDisk({}),
    clock: fakeClock(),
    log: fakeLog(),
    proc: fakeProc({}),
    index: { dead: () => "", fault: () => "", warm: () => ({ warmed: false }) },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
  box.cloud = true;
  const said = await decide({ event: "tool.call", e: { tool: ASK } }, box);
  assert.equal(said?.result?.deny, ASKS_NOBODY);
});
