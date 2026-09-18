// The stop rules this tree ships. A stop the agent claims over its own work
// carries yields, so a check reading the tree beats it.
// [[spec/design_output/stop#a-check-beats-a-claim]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { pool } from "../../.claude/skills/level0/lib/stop.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const at = join(root, "spec", "config", "stop", "level0.yml");
const rules = pool([{ name: "level0.yml", text: files.read(at) }]).rules;
const by = (id) => rules.find((one) => one.id === id);

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("every stop the agent claims over its own work yields to a check", () => {
  for (const id of [
    "a-wrong-answer-leaves-the-box",
    "the-work-stands-complete",
    "an-update-is-worth-giving",
  ]) {
    assert.equal(by(id)?.yields, true, `${id} yields to a check`);
  }
});

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("a stop the owner drives stands over a check", () => {
  assert.equal(by("the-owner-asks-to-talk")?.yields, undefined);
  assert.equal(by("the-chat-is-new")?.yields, undefined);
});

// [[spec/design_output/stop#the-blast-radius-decides]]
test("the stop rule asks the blast radius, and the person test goes", () => {
  assert.equal(by("a-person-holds-the-answer"), undefined, "the person test goes");
  const said = by("a-wrong-answer-leaves-the-box");
  assert.equal(said?.decides, "claimed");
  assert.match(said?.asks ?? "", /wrong answer/, "the question asks the cost");
});
