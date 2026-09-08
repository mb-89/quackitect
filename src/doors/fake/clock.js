// A clock a test hands in, so a case replays.
// [[spec/design_output/doors#a-fake-behaves]]

export function fakeClock(from = "2026-01-01T00:00:00.000Z", stepMs = 1000) {
  let at = new Date(from).getTime();
  return {
    now: () => new Date(at),
    stamp: () => new Date(at).toISOString(),
    tick(by = stepMs) {
      at += by;
      return new Date(at);
    },
  };
}
