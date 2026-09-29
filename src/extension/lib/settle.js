// A burst of calls runs its work once, a span after the last call. The timer
// comes in as an argument, so a test drives it without a clock.
// [[spec/tickets/the-badge-reads-open-tasks]]

// The span a burst of file writes takes to settle, before the sidebar draws the badge again. [[spec/tickets/the-badge-reads-open-tasks]]
const BURST = 300;

// [[spec/tickets/the-badge-reads-open-tasks]]
function settled(run) {
  return () => run();
}

module.exports = { BURST, settled };
