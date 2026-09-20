// The awake door on the server's box: the box carries one, a fake stands in
// for it, and the hold and the release are what the server calls.
// [[spec/design_output/level0#the-server-holds-off-sleep]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { boxOf } from "../../src/bridge/server.js";
import { fakeAwake } from "../../src/doors/fake/awake.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";

test("the box carries the awake door, and takes the fake a test hands in", () => {
  const awake = fakeAwake();
  const box = boxOf(ROOT, ROOT, {
    disk: fakeDisk(),
    clock: fakeClock(),
    proc: fakeProc(),
    log: fakeLog(),
    awake,
  });
  assert.equal(box.awake, awake);

  const held = box.awake.hold();
  assert.equal(held.held, true, "the hold stands while the server runs");
  held.release();
  assert.deepEqual(awake.holds, [{ held: true, released: true }]);
});

test("a box handed no awake door builds the real one, which answers hold", () => {
  const box = boxOf(ROOT, ROOT, { disk: fakeDisk(), clock: fakeClock(), proc: fakeProc() });
  assert.equal(typeof box.awake.hold, "function");
});
