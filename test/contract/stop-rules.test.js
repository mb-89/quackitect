// The stop rules this tree ships. A stop the agent claims over its own work
// carries yields, so a check reading the tree beats it.
// [[spec/design_output/stop#a-check-beats-a-claim]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { pool } from "../../.claude/skills/level0/lib/stop.js";
import { ENGINE_CHECKS, knowsCheck, standsDown } from "../../src/bridge/stop.js";
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
test("the warnings check reads the hand's work, so a claim of done stands over it", () => {
  const said = by("warnings-stand-past-the-number");
  assert.equal(said?.beside, true);
  assert.ok(said.priority < by("the-work-stands-complete").priority);
});

// [[spec/design_output/stop#a-check-beats-a-claim]]
test("a stop the owner drives stands over a check", () => {
  assert.equal(by("the-owner-asks-to-talk")?.yields, undefined);
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

// [[spec/design_output/stop#the-mechanical-checks]]
test("the door answers every check the shipped rules name, and the gate names four", () => {
  const where = join(root, "spec", "config", "stop");
  const shipped = files
    .list(where)
    .filter((one) => one.name.endsWith(".yml"))
    .flatMap(
      (one) =>
        pool([{ name: one.name, text: files.read(join(where, one.name)) }]).rules,
    )
    .map((one) => one.runs)
    .filter((one) => one && one !== "never");
  assert.ok(shipped.length, "the rules name a check");
  for (const name of new Set(shipped)) {
    assert.ok(knowsCheck(name), `the stop door answers ${name}`);
  }
  assert.equal(
    knowsCheck("a-check-nobody-wrote"),
    false,
    "a name the door answers nowhere",
  );
  for (const name of ENGINE_CHECKS) {
    assert.ok(shipped.includes(name), `${name} stands in the shipped rules`);
    assert.equal(standsDown(name, "god"), true, name);
  }
});
