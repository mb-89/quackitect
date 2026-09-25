// The drawing's edits, driven in node: a route and the reached steps go in,
// and the whole route `ticket route` takes comes out, or null where the edit
// touches a reached step.
// [[spec/design_output/drawing#the-page-takes-an-edit]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { dropped, moved, reachedIn } from "../../src/extension/webview/route/edit.js";
import { graphOf } from "../../src/scripts/graph.js";
import { aheadOnly } from "../../src/scripts/ticket-route.js";

const FRONT = {
  steps: [
    { name: "design", steps: [{ name: "draft" }, { name: "review" }] },
    { name: "ship", does: "lands it" },
    { name: "tell" },
  ],
  step: "design/draft",
};
const REACHED = reachedIn(graphOf(FRONT));
const names = (steps) => steps.map((one) => one.name);

test("a move swaps a step ahead with its sibling, and ticket route takes the answer", () => {
  const out = moved(FRONT.steps, "ship", 1, REACHED);
  assert.deepEqual(names(out), ["design", "tell", "ship"]);
  assert.equal(out[2].does, "lands it");
  assert.deepEqual(aheadOnly(FRONT, out), { steps: out });
  assert.deepEqual(names(FRONT.steps), ["design", "ship", "tell"], "the host's route stands");
  const inner = moved(FRONT.steps, "design/review", -1, new Set());
  assert.deepEqual(names(inner[0].steps), ["review", "draft"]);
});

test("a drop takes a step ahead out, and ticket route takes the answer", () => {
  const out = dropped(FRONT.steps, "tell", REACHED);
  assert.deepEqual(names(out), ["design", "ship"]);
  assert.deepEqual(aheadOnly(FRONT, out), { steps: out });
});

test("an edit touching a reached step, or past the ends, answers null", () => {
  assert.deepEqual([...REACHED], ["design", "design/draft"]);
  assert.equal(moved(FRONT.steps, "design/draft", 1, REACHED), null);
  assert.equal(moved(FRONT.steps, "ship", -1, REACHED), null);
  assert.equal(moved(FRONT.steps, "tell", 1, REACHED), null);
  assert.equal(dropped(FRONT.steps, "design", REACHED), null);
  assert.equal(dropped(FRONT.steps, "gone", REACHED), null);
});
