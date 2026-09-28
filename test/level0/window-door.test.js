// The window's own door stands one port below the bridge, where the register
// hands out none, so a second launch reaches the first and no vehicle takes it.
// [[spec/design_output/tui#a-second-launch-hands-over]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PORT_BASE, withPort } from "../../.claude/skills/level0/lib/vehicle.js";
import { PORT } from "../../src/bridge/window.js";

test("the window listens one port below the bridge", () => {
  assert.equal(PORT, PORT_BASE - 1);
});

test("no vehicle the register places takes the window's port", () => {
  const list = [];
  for (let at = 0; at < 4; at++) {
    list.push(withPort(list, { id: `v${at}`, method_root: `/tree/${at}` }));
  }
  assert.equal(
    list.some((one) => one.port === PORT),
    false,
  );
  assert.deepEqual(
    list.map((one) => one.port),
    [PORT_BASE, PORT_BASE + 1, PORT_BASE + 2, PORT_BASE + 3],
  );
});
