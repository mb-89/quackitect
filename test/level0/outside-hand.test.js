// The environment rides the hand a root builds, and every module past one reads
// it there. Each case here hands its own map in, so none touches the box it
// runs on.
// [[spec/design_output/doors#a-door-reads-the-outside]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { guidanceHere } from "../../src/bridge/guidance.js";
import { boxOf } from "../../src/bridge/server.js";
import { registeredPort } from "../../src/bridge/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { verbs } from "../../src/scripts/cli.js";
import { handRule } from "../../src/scripts/pull-hand.js";
import { registerDirs } from "../../src/scripts/vehicle.js";
import { work } from "../../src/scripts/work.js";

const CLOUD = { CLAUDE_CODE_REMOTE: "true" };

test("the box a root builds carries the environment and the node path", () => {
  const said = boxOf("/tree", "/tree", { disk: fakeDisk(), clock: fakeClock() });
  assert.equal(typeof said.env, "object");
  assert.equal(typeof said.node, "string");
  const named = boxOf("/tree", "/tree", {
    disk: fakeDisk(),
    clock: fakeClock(),
    node: "/node/bin/node",
  });
  assert.equal(named.node, "/node/bin/node", "a case names its own node");
  assert.equal(typeof said.pid, "number");
});

// A tree with no identity runs the road that makes one, and the pid the case hands ends it. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the port road makes an identity off the pid the root hands in", () => {
  const files = fakeDisk({ "/tools/package.json": '{"version":"0.1.0"}' });
  registeredPort(files, { SE_REGISTRY: "/reg" }, fakeClock(), "/tools", 7, false);
  const made = JSON.parse(files.read("/tools/.se/.runtime/identity.json"));
  assert.ok(made.id.endsWith("7"), `the identity reads ${made.id}`);
});

test("the hand rule reads the cloud off the hand, and none off the box", () => {
  assert.equal(handRule({ env: CLOUD }, {}, [], "").cloud, true);
  assert.equal(handRule({ env: {} }, {}, [], "").cloud, false);
  assert.equal(handRule({}, {}, [], "").cloud, false);
});

test("the register splits its list the way the caller says", () => {
  const env = { SE_REGISTRY: "/one;/two" };
  assert.deepEqual(registerDirs(env, true), ["/one", "/two"]);
  assert.deepEqual(registerDirs(env, false), ["/one;/two"]);
  assert.deepEqual(registerDirs({ SE_REGISTRY: "/one:/two" }), ["/one", "/two"]);
});

// The port road hands the platform down, so a register list reads the same. [[spec/design_output/doors#a-door-reads-the-outside]]
test("the port reading takes the platform and reaches the same register", () => {
  const files = fakeDisk({
    "/one/register.json": JSON.stringify([
      { id: "abc123", port: 6543, method_root: "/tools", version: "0.1.0" },
    ]),
  });
  const env = { SE_REGISTRY: "/one;/two" };
  assert.equal(registeredPort(files, env, fakeClock(), "/tools", 7, true), 6543);
});

test("the guidance reading takes an empty map where nobody hands one", () => {
  const said = guidanceHere(fakeDisk(), "/tree");
  assert.equal(typeof said, "object");
});

test("the work verbs and the command root stand after the change", () => {
  assert.equal(typeof work, "function");
  assert.equal(typeof verbs.check.run, "function");
});
