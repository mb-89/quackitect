---
form: time-the-computed-view
by: agent
signed_off: 2026-08-23T18:29:48.261Z
authors: agent
files:
---

# Evidence form / time-the-computed-view

## current_situation

THE ONE-HOUR BOX WAS NOT NEEDED. The surface already profiles itself by phase, and 47 profiled renders stand in this machine's own call log.

MEASURED, NOT INFERRED. One profiled render, call-80e6f522728b at 2026-08-23T18:27:37Z, a request for the machine widget totalling 1190.2 ms:

- machine.sets: 1163.6 ms
- machine.states: 23.3 ms
- machine.svg: 0.66 ms
- session: 0.75 ms
- packet: 0.54 ms
- data: 0.79 ms
- shared: 0.39 ms
- checked_docs: 0.004 ms

NINETY-EIGHT PER CENT OF THE RENDER IS ONE PHASE. Everything the surface does with the result is under 26 ms combined. Across all 47 profiled renders the median is 360 ms and the p95 is 406 ms.

## built

- none

## follow_up

THE SPIKE PRODUCED A FINDING AND NO ARTIFACT. Throwaway means throwaway; the two scripts that read the log are scratch and nothing survives but this.

THE VERDICT: THE ROUND TRIP IS NOT THE COST, AND THE DECISION DOES NOT ADD ONE. The expensive work is already engine-side and already inside the same request. Moving view resolution into the engine moves nothing that was not already there.

THE ASSUMPTION HOLDS, for a different reason than it was written. It asked whether a computed view can answer inside the second. The answer is that the view is already computed inside the engine's own request, and the surface's own share is 26 ms.

THE AT-RISK VERDICT ON LATENCY MUST BE WITHDRAWN. Three cards rest on it: req-surface-answers-in-one-second, req-call-answers-in-one-second and req-responsiveness. The hinge they name, a round trip the resolver adds, does not exist.

THE SECOND HAND'S SCORE WAS WRONG FOR THE SAME REASON. It scored the grafted design 2 against the base's 3, reading "all computed once, server side" as new cost. That cost is already paid, in a phase neither candidate changes.

THAT REOPENS THE COUNT. The winner took its seat two-to-two on severity and latency was one of the guarded collapse's two wins. If latency does not separate them, the repeater's mechanisms take the count outright. THE BUILT THING DOES NOT CHANGE, because the graft already carries both. What changes is that its one recorded cost is not real.

A STANDING DEFECT IS NAMED IN PASSING AND IT IS NOT THIS ROUND'S. machine.sets costs a second on its own and nothing in this decision touches it. That is where the one-second budget actually breaks.

## anything_else

