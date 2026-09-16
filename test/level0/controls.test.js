// The two controls that reach level zero. The hold answers the tooth and the
// ask answers the block, so each case here says what one value of the key puts
// in front of the agent.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { controlBlock, holds } from "../../.claude/skills/level0/lib/controls.js";

// [[spec/design_output/extension#the-hold-is-one-rule]]
test("the hold stops a turn at stopped, and at nothing else", () => {
  assert.equal(holds("stop"), true);
  assert.equal(holds("finish"), false);
  assert.equal(holds("off"), false);
  assert.equal(holds(undefined), false);
});

// [[spec/design_output/extension#the-ask-is-a-line]]
test("a running hold and a quiet ask put no block in front of the agent", () => {
  assert.equal(controlBlock({ hold: "off", wanted: "quiet" }), "");
  assert.equal(controlBlock({}), "");
});

test("the hold at finishing says to put the work down and start nothing new", () => {
  const said = controlBlock({ hold: "finish", wanted: "quiet" });
  assert.match(said, /# What the owner asks for/);
  assert.match(said, /Put the work down: carry the piece\nin hand to its end, start nothing new/);
});

// [[spec/design_output/stop#the-hold]]
test("the hold at stop says to put the work down and end the turn", () => {
  const said = controlBlock({ hold: "stop", wanted: "quiet" });
  assert.match(said, /Put the work down where it stands/);
  assert.match(said, /end the turn with the stop line/);
});

test("a short ask asks for a line or two, and a full one for the whole report", () => {
  assert.match(controlBlock({ wanted: "short" }), /Say it in a line or two/);
  assert.match(controlBlock({ wanted: "full" }), /what stands done, what stands open/);
});

test("a hold and an ask standing together each carry their own lines", () => {
  const said = controlBlock({ hold: "finish", wanted: "short" });
  assert.match(said, /start nothing new/);
  assert.match(said, /Say it in a line or two/);
});
