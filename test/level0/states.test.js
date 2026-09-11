// The status bar and the toasts, read out of the values alone. A state stands
// where a key leaves rest, and a toast marks the moment it leaves.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { statesOf, toastsOf } from "../../src/extension/lib/states.js";

const values = (said) =>
  new Map(Object.entries(said).map(([key, value]) => [key, { value }]));

// [[spec/design_output/extension#the-status-bar-says-it]]
test("god mode shows on the error background, and a click puts the queue back", () => {
  const [one] = statesOf(values({ "engine.binding": "god" }));
  assert.equal(one.key, "engine.binding");
  assert.equal(one.tone, "error");
  assert.equal(one.rest, "queue");
  assert.match(one.text, /level zero refuses nothing/);
});

test("unbound and a hold each show, and rest shows nothing", () => {
  const said = statesOf(
    values({ "engine.binding": "unbound", "stop.hold": "stopped" }),
  );
  assert.deepEqual(
    said.map((one) => [one.key, one.value, one.tone]),
    [
      ["engine.binding", "unbound", "warning"],
      ["stop.hold", "stopped", "error"],
    ],
  );
  assert.deepEqual(
    statesOf(values({ "engine.binding": "queue", "stop.hold": "running" })),
    [],
  );
  assert.deepEqual(statesOf(new Map()), []);
});

test("a toast marks a state arriving, and a state standing still toasts once", () => {
  const before = statesOf(values({ "stop.hold": "finishing" }));
  const after = statesOf(values({ "stop.hold": "finishing", "engine.binding": "god" }));
  assert.deepEqual(
    toastsOf(before, after).map((one) => one.value),
    ["god"],
  );
  assert.deepEqual(toastsOf(after, after), []);
  const moved = statesOf(values({ "stop.hold": "stopped", "engine.binding": "god" }));
  assert.deepEqual(
    toastsOf(after, moved).map((one) => one.value),
    ["stopped"],
  );
});
