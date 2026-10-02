// The clear a handover asks for, held until a place the host runs it from. The
// host runs a plugin's command from no hook the turn waits on, and names the
// turn's completion, so a clear the Stop answers waits there, or for a timer.
// [[spec/tickets/the-clear-runs-live-remote]]

// The span a clear the Stop answers waits for the turn's completion, before a timer runs it. [[spec/tickets/the-clear-runs-live-remote]]
export const CLEAR_FALLBACK_MS = 2000;

let waiting = null;

export function holdsClear(prompt) {
  waiting = prompt;
}

// The clear left waiting, taken once, or null where none waits. [[spec/tickets/the-clear-runs-live-remote]]
export function takesClear() {
  const prompt = waiting;
  waiting = null;
  return prompt;
}
