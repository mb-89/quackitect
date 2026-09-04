// WHAT THE LIGHT SHOULD SAY, DECIDED IN ONE PLACE.
//
// Four states, and the light in the button is the whole of what a person needs
// to read: idle is nothing running, busy is a start in flight, good is up and
// proving it, bad is up and not answering.
//
// THE LIGHT COULD ONLY GO ONE WAY. The poll that reads liveness began with a
// line that returned unless the state was already good, so once it had gone to
// idle or bad nothing looked again. An engine started from a terminal, or one
// started after a stale pair was stopped, left the button red for the rest of
// the window's life, and pressing start was the only way to agree with what was
// already true. That is what a person met: an engine running with a fresh
// heartbeat and a red light above it.
//
// SO THE DECISION IS A FUNCTION AND NOT A BRANCH INSIDE A TIMER. A timer is not
// a thing a check can drive. This is, and the timer's whole job is to call it
// with what is on disk.

export type EngineState = "idle" | "busy" | "good" | "bad";

// What the engine's own file says about itself, or nothing when there is none
// or its process is gone.
export type Running = { pid: number; log: string; session: string; beat?: string };

// A heartbeat is written every few seconds. Two missed beats and more is the
// engine being there and not answering, which is the failure a heartbeat exists
// to find.
export const HEARTBEAT_MS = 5000;
export const MISSED_BEATS = 2.5;

// nextEngineState answers what the light should say now.
//
// BUSY IS LEFT ALONE, because a start in flight has its own budget and its own
// watchdog, and a poll that overwrote it would call a starting engine dead
// before it had a chance to answer.
export function nextEngineState(
  current: EngineState,
  running: Running | undefined,
  now: number,
): EngineState {
  if (current === "busy") return "busy";
  if (!running) {
    // NOTHING ANSWERING IS BAD, AND THAT IS THE WHOLE POINT OF A WATCHDOG. A
    // first version called it idle, on the reasoning that bad means a problem
    // with an engine that is there. The owner overruled it: a watchdog exists
    // to find the case where nothing answers, and no engine at all is that case
    // in its strongest form.
    //
    // idle is what the light says before anything has been asked to start, and
    // the poll never returns to it.
    return "bad";
  }
  const beat = running.beat ? Date.parse(running.beat) : 0;
  if (beat && now - beat > HEARTBEAT_MS * MISSED_BEATS) {
    return "bad";
  }
  return "good";
}

// WHO ENDS THE ENGINE, AND WHEN.
//
// deactivate called stopEngine with no argument, so a window that had only
// reattached held no child handle and killed nothing. Nothing on the engine's
// own side ends it either, so it outlived the editor.
//
// AND THE ANSWER IS NOT ALWAYS TO KILL. Two windows can be open on one tree.
// The second one reattaches, and ending the engine when it closes would take
// it away from the first, which is still watching. So the rule is the last
// window out, and this is where that rule is written down.
//
// IT IS HANDED THE PROBE RATHER THAN CALLING ONE, for the same reason
// nextEngineState is handed now rather than reading the clock. A function that
// reaches for the world is not a thing a check can drive, and this is.
export function endsTheEngine(
  others: { pid: number }[],
  answers: (pid: number) => boolean,
): boolean {
  return !others.some((w) => answers(w.pid));
}

// whyNot answers the detail beside a state, in the words a person reads.
export function whyNot(state: EngineState, running: Running | undefined): string {
  if (state !== "bad") return "";
  if (!running) return "nothing is running";
  return "the engine stopped answering";
}
