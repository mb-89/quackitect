// The clock. A test hands in its own, so a case replays.
// [[spec/design_output/doors#one-door-per-outside-thing]]

// A timer an unref names lets the process end while it waits. [[spec/design_output/doors#time-is-a-door]]
export function clock() {
  const after = (ms, fn, { unref = false } = {}) => {
    const timer = setTimeout(fn, ms);
    if (unref) timer.unref?.();
    return { cancel: () => clearTimeout(timer) };
  };
  return {
    now: () => new Date(),
    stamp: () => new Date().toISOString(),
    ms: () => Date.now(),
    after,
    wait: (ms, init) => new Promise((done) => after(ms, done, init)),
  };
}
