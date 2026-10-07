// The settle helper with a fake timer: a burst of calls runs its work once, a
// span after the last call, and a call after the burst starts a new one.
// [[spec/tickets/the-badge-reads-open-tasks]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import * as settle from "../../src/extension/lib/settle.js";

const { BURST, settled } = settle;

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

// The clock door owns the timer, so settle carries none of its own. [[spec/design_output/doors#time-is-a-door]]
test("a burst settles on the clock door's timer, and settle carries no timer of its own", () => {
  assert.equal("timer" in settle, false);
  const time = fakeClock();
  let ran = 0;
  const call = settled(
    () => (ran += 1),
    BURST,
    (run, span) => time.after(span, run),
  );

  call();
  time.tick(BURST - 1);
  call();
  time.tick(BURST - 1);
  assert.equal(ran, 0, "a burst runs nothing before it settles");
  time.tick(1);
  assert.equal(ran, 1);
});
