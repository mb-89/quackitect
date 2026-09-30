// The settle helper with a fake timer: a burst of calls runs its work once, a
// span after the last call, and a call after the burst starts a new one.
// [[spec/tickets/the-badge-reads-open-tasks]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BURST, settled } from "../../src/extension/lib/settle.js";

function fakeTimer() {
  const set = [];
  const later = (run, span) => {
    const one = { run, span, cancelled: false, cancel: () => (one.cancelled = true) };
    set.push(one);
    return one;
  };
  return { set, later };
}

// [[spec/tickets/the-badge-reads-open-tasks]]
test("a burst of calls runs once, a span after the last", async () => {
  const timer = fakeTimer();
  let ran = 0;
  const call = settled(() => (ran += 1), BURST, timer.later);

  call();
  call();
  call();
  assert.equal(ran, 0, "a burst runs nothing before it settles");
  assert.deepEqual(
    timer.set.map((one) => [one.span, one.cancelled]),
    [
      [BURST, true],
      [BURST, true],
      [BURST, false],
    ],
  );

  await timer.set.at(-1).run();
  assert.equal(ran, 1);

  call();
  assert.equal(timer.set.length, 4, "a call after the burst starts a new one");
  assert.equal(timer.set.at(-2).cancelled, false, "a settled timer takes no cancel");
});
