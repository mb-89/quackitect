// A clock a test hands in, so a case replays.
// [[spec/design_output/doors#a-fake-behaves]]

import { behaves } from "./behaves.js";

export function fakeClock(from = "2026-01-01T00:00:00.000Z", stepMs = 1000) {
  let at = new Date(from).getTime();
  let made = 0;
  const timers = [];
  const after = (ms, fn) => {
    const one = { due: at + ms, made: made++, fn };
    timers.push(one);
    return {
      cancel: () => {
        const place = timers.indexOf(one);
        if (place >= 0) timers.splice(place, 1);
      },
    };
  };
  const next = (until) =>
    timers
      .filter((one) => one.due <= until)
      .sort((a, b) => a.due - b.due || a.made - b.made)[0];
  return behaves({
    now: () => new Date(at),
    stamp: () => new Date(at).toISOString(),
    ms: () => at,
    after,
    wait: (ms) => new Promise((done) => after(ms, done)),
    // A tick fires each timer it passes, in the order they fall due. [[spec/design_output/doors#a-fake-behaves]]
    tick(by = stepMs) {
      const until = at + by;
      for (let one = next(until); one; one = next(until)) {
        timers.splice(timers.indexOf(one), 1);
        at = one.due;
        one.fn();
      }
      at = until;
      return new Date(at);
    },
  }, "clock");
}
