// Whether a hand works a leaf. One function answers it, and every case here
// hands it a leaf and a hand, so the pull and the write door read one rule.
// [[spec/tickets/the-one-answer-takes-shape]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { writesHere } from "../../.claude/skills/level0/lib/ticket.js";

const leaf = (by) => ({ by, path: "design/review" });
const desk = { agent: false };
const agent = { agent: true };
const cloud = { agent: true, cloud: true };

test("a leaf naming anyone takes any hand", () => {
  for (const hand of [desk, agent, cloud]) {
    assert.deepEqual(writesHere(leaf("anyone"), hand), { writes: true, why: "" });
  }
  assert.equal(writesHere({ path: "x" }, agent).writes, true);
});

// [[spec/tickets/the-one-answer-takes-shape]]
test("a person's step refuses an agent, takes a person, and takes the owner's word", () => {
  const refused = writesHere(leaf("person"), agent);
  assert.equal(refused.writes, false);
  assert.match(refused.why, /waits for a person at design\/review/);
  assert.equal(refused.person, true);

  assert.equal(writesHere(leaf("person"), desk).writes, true);
  assert.equal(
    writesHere(leaf("person"), { agent: true, ownerSays: true }).writes,
    true,
  );
});

// A cloud box answers every question it meets. [[spec/guidance/cloud]]
test("a person's step stands open to a cloud box, with no owner's word", () => {
  assert.deepEqual(writesHere(leaf("person"), cloud), { writes: true, why: "" });
});

// [[spec/tickets/the-one-answer-takes-shape]]
test("an agent's step refuses a person, and a helper's step refuses every hand", () => {
  assert.equal(writesHere(leaf("agent"), desk).writes, false);
  assert.equal(writesHere(leaf("agent"), agent).writes, true);

  for (const hand of [desk, agent, cloud]) {
    assert.equal(writesHere(leaf("helper"), hand).writes, false);
  }
});

// The children do that work, so no hand writes there. [[spec/tickets/the-one-answer-takes-shape]]
test("a children's step refuses every hand, whatever the box is", () => {
  for (const hand of [desk, agent, cloud]) {
    const said = writesHere(leaf("children"), hand);
    assert.equal(said.writes, false);
    assert.match(said.why, /waits for its own children/);
  }
});

// [[spec/tickets/the-one-answer-takes-shape]]
test("a retro step takes a hand at a retro, and refuses one away from it", () => {
  assert.equal(writesHere(leaf("retro"), agent).writes, false);
  assert.equal(writesHere(leaf("retro"), { agent: true, atRetro: true }).writes, true);
});

// [[spec/guidance/cloud]]
test("the cloud test reads either variable, and a flat value reads false", () => {
  assert.equal(inCloud({ CLAUDE_CODE_REMOTE: "1" }), true);
  assert.equal(inCloud({ SE_CLOUD: "yes" }), true);
  assert.equal(inCloud({ CLAUDE_CODE_REMOTE: "0" }), false);
  assert.equal(inCloud({ SE_CLOUD: "false" }), false);
  assert.equal(inCloud({ SE_CLOUD: "" }), false);
  assert.equal(inCloud({}), false);
  assert.equal(inCloud(), false);
});
