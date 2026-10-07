// The failure door against the real nodes under spec/failures, and its fake
// held to the same lines.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeFailure } from "../../src/doors/fake/failure.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { failure } from "../../src/doors/failure.js";

const ID = "failure-unregistered";
const REMEDY =
  "Run ./RUNME.sh failure new <id> --level=<level> --remedy=<line>, then raise the failure again.";

test("the door reads the real nodes under spec/failures", async () => {
  const real = failure(disk(), fakeLog(fakeClock()));
  const fake = fakeFailure([{ id: ID, level: "error", remedies: [REMEDY] }]);
  const want = ["it fails", `failure ${ID} at error`, `remedy: ${REMEDY}`];
  assert.deepEqual(await real.raise(ID, "it fails"), want);
  assert.deepEqual(await fake.raise(ID, "it fails"), want);
});

// A caller answering its code at once reads the lines with no wait. [[spec/tickets/the-twins-leave-whole]]
test("the door answers a raise's lines at once, and the fake answers the same", () => {
  const real = failure(disk(), fakeLog(fakeClock()));
  const fake = fakeFailure([{ id: ID, level: "error", remedies: [REMEDY] }]);
  const want = ["it fails", `failure ${ID} at error`, `remedy: ${REMEDY}`];
  assert.deepEqual(real.lines(ID, "it fails"), want);
  assert.deepEqual(fake.lines(ID, "it fails"), want);
});
