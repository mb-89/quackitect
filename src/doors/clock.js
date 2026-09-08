// The clock. A test hands in its own, so a case replays.
// [[spec/design_output/doors#one-door-per-outside-thing]]

export function clock() {
  return {
    now: () => new Date(),
    stamp: () => new Date().toISOString(),
  };
}
