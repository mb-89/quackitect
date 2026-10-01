// The probe a cloud take runs asks the port the server listens on: the
// pointer, then the port variable, then the register, as the listen reads it.
// [[spec/tickets/serve-probes-the-register-port]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { MARKER, PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { registeredPort } from "../../src/bridge/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { portIn } from "../../src/scripts/serve.js";

const TREE = "/tree";
const OTHER = "/other";
const ENV = { HOME: "/home/one" };

function doors(env = ENV) {
  const disk = fakeDisk({
    [join(TREE, ...MARKER.split("/"))]: "{}",
    [join(OTHER, ...MARKER.split("/"))]: "{}",
  });
  const clock = fakeClock();
  return { disk, clock, it: { disk, clock, join, root: TREE, env, pid: 2 } };
}

test("a probe with no pointer asks the port the register hands this vehicle, the port the listen takes", () => {
  const { disk, clock, it } = doors();
  assert.equal(
    registeredPort(disk, ENV, clock, OTHER, 1),
    PORT_BASE,
    "another vehicle holds the base",
  );
  const probed = portIn(it);
  assert.notEqual(probed, PORT_BASE);
  assert.equal(probed, registeredPort(disk, ENV, clock, TREE, 2));
});

test("the port variable answers before the register, as the listen reads it", () => {
  const { it } = doors({ ...ENV, SE_BRIDGE_PORT: "6600" });
  assert.equal(portIn(it), 6600);
});
