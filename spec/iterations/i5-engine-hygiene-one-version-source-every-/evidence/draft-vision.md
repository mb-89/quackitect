---
form: draft-vision
by: agent
signed_off: 2026-08-19T10:55:59.818Z
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation

M0 is signed. The kickoff blessed `minor` and the engine pinned a 29-state machine to the record.

What this state inherits: five goals, thirteen source items, and the knowledge that 2 of the first 3 items opened were already settled.

Nothing is built. The tree stands as i16 and i17 merged it.

## goal_system

FIVE GOALS, in the order this record will serve them.

- G1 — ONE VERSION SOURCE, END TO END. The engine already reads its version from the manifest. What is missing is the entrypoint flag that lets a packaged build be asked for it without starting a server.
- G2 — EVERY REFUSAL CLAUSE IS ANCHORED to its section in the guidance, and a test refuses an unanchored one.
- G3 — THE PAINT RULES ARE PINNED by tests. Green means submitted, the thumb means blessed, and a law-proven green is told apart from an opinion.
- G4 — THE STANDING SMALL DEFECTS from the 2026-08-13 pool are each fixed, or struck with the evidence that they no longer stand.
- G5 — THE BATTERY'S HEAVIEST TEST FILE stops dominating the wall clock.

THREE CONFLICTS, NAMED OPENLY.

- G3 AND G5 PULL AGAINST EACH OTHER. Pinning the paint rules ADDS test cases, and G5 wants the battery shorter. The pins are small and the heavy file is not the one they land in, so the cost is real but not on the critical path. G3 wins where they meet, because a missing pin is a correctness hole and a slow battery is a comfort cost.
- G4 AND EVERY OTHER GOAL COMPETE FOR ONE DAY. Thirteen source items in a bundle whose list is six days old. The resolution is the one the audit already started: strike what no longer stands FIRST, so the day is spent on what is real.
- G5 MAY NOT BE ACHIEVABLE AT ALL, and that is a conflict with its own goal statement. i16 measured refs.test.ts at 139,017 ms and 14.1 percent of the battery, and concluded that halving it would not shorten the wait by one second because another file sets the critical path. If that holds, G5 is satisfied by MEASURING and striking, never by splitting.

THE PRIORITY ORDER, RULED.

- FIRST, G4's strike pass. It decides how much of the rest exists.
- THEN G1 and G2, which are the two with owner rulings behind them and the least design risk.
- THEN G3, which is pure test authoring against rules that already stand.
- LAST, G5, because it is the only goal that may turn out to be a no-op, and finding that out early costs a measurement rather than a build.

WHAT IS NOT A GOAL. Widening the trace, changing the corpus, or ruling on the whole-battery guard's open design questions. Each was left out at the kickoff with where it went.

## follow_up

log-risks is next and takes the three conflicts above as its input.

The sharpest one to carry forward: G5 may be a no-op, and the measurement that decides it does not exist on this container.

frame-delta carries the strike pass that the priority order puts first.

## anything_else

THE ORDER ABOVE IS NOT THE MACHINE'S ORDER. The machine walks its 29 states in its own sequence, and this is the order of ATTENTION inside the build states — which item gets opened first when several are legal at once.
