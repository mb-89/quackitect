// The stop rules this tree ships. A stop the agent claims over its own work
// carries yields, so a check reading the tree beats it.
// [[spec/design_output/stop#a-check-beats-a-claim]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { pool } from "../../.claude/skills/level0/lib/stop.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const at = join(root, "spec", "config", "stop", "level0.yml");
const rules = pool([{ name: "level0.yml", text: files.read(at) }]).rules;
const by = (id) => rules.find((one) => one.id === id);

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("every stop the agent claims over its own work yields to a check", () => {
  for (const id of ["a-wrong-answer-leaves-the-box", "the-work-stands-complete"]) {
    assert.equal(by(id)?.yields, true, `${id} yields to a check`);
  }
});

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("a stop the owner drives stands over a check", () => {
  assert.equal(by("the-owner-holds-the-step")?.yields, undefined);
  assert.equal(by("the-chat-is-new")?.yields, undefined);
});

// A running helper is the harness's fact, so the claim stands over the plan and yields to nothing. [[spec/design_output/stop#a-helper-still-runs]]
test("the helper stop stands over the plan, and yields to no check", () => {
  const said = by("your-helpers-still-run");
  assert.equal(said?.decides, "claimed");
  assert.equal(said?.runs, "helpers-running");
  assert.equal(said?.yields, undefined);
  assert.ok(said.priority > by("work-still-stands").priority, "the plan holds no wait");
});

// The owner asks for an update through the report, so no stop rule claims one. [[spec/design_output/stop#a-check-beats-a-claim]]
test("no stop rule claims an update", () => {
  assert.equal(by("an-update-is-worth-giving"), undefined);
});

// [[spec/design_output/stop#the-blast-radius-decides]]
test("the stop rule asks the blast radius, and the person test goes", () => {
  assert.equal(by("a-person-holds-the-answer"), undefined, "the person test goes");
  const said = by("a-wrong-answer-leaves-the-box");
  assert.equal(said?.decides, "claimed");
  assert.match(said?.asks ?? "", /wrong answer/, "the question asks the cost");
});

// The talk rule goes, and a turn waiting on the owner's step ends on a reason naming that step. [[spec/tickets/the-stop-reads-the-state]]
test("no rule carries the talk id, and the owner's step outranks every continue that loops the wait", () => {
  assert.equal(by("the-owner-asks-to-talk"), undefined);
  const said = by("the-owner-holds-the-step");
  assert.equal(said?.side, "stop");
  assert.equal(said?.decides, "claimed");
  assert.equal(said?.waits, "owner");
  assert.equal(said?.runs, "step-waits-on-person");
  for (const id of ["work-still-stands", "the-last-line-names-no-stop"]) {
    assert.ok(said.priority > by(id).priority, `it outranks ${id}`);
  }
});
