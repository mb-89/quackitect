// A burst of calls runs its work once, a span after the last call. The timer
// comes in as an argument, so a test drives it without a clock.
// [[spec/tickets/the-badge-reads-open-tasks]]

// The span a burst of file writes takes to settle, before the sidebar draws the badge again. It stands above burstSettleDelay in src/index/door.go, so the index sweeps the burst before the badge's verb asks it. [[spec/tickets/the-badge-reads-open-tasks]]
const BURST = 500;

// The editor's timer, with the cancel a later call takes. [[spec/tickets/the-badge-reads-open-tasks]]
function timer(run, span) {
  const one = setTimeout(run, span);
  return { cancel: () => clearTimeout(one) };
}

// [[spec/tickets/the-badge-reads-open-tasks]]
function settled(run, span, later) {
  let waiting = null;
  return () => {
    waiting?.cancel();
    waiting = later(() => {
      waiting = null;
      return run();
    }, span);
  };
}

module.exports = { BURST, settled, timer };
