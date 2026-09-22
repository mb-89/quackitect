// The window's own door stands one port above the bridge, so a second launch
// reaches the first.
// [[spec/design_output/tui#a-second-launch-hands-over]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { PORT } from "../../src/bridge/window.js";

test("the window listens one port above the bridge", () => {
  assert.equal(PORT, PORT_BASE + 1);
});
