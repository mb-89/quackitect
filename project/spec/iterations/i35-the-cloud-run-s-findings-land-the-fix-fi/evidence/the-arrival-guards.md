---
form: the-arrival-guards
by: agent
signed_off: 2026-08-17T12:09:38.384Z
authors: agent
files: null
---

# Evidence form / the-arrival-guards

## current_situation

The arrival worked and nothing would notice if it stopped working.

The requirement whose failure is silent is req-the-arrival-never-costs-the-session: a hook that ends a session start, or an arrival that half-completes and leaves an agent believing it is caged.

## built

project/deliverable/tests/arrival.test.ts — six cases, about one second, bound by tsp-the-arrival.

WHAT IS PINNED: a runtime below the floor stops the arrival AND leaves package.json byte-identical; a stopped arrival places no cage; the hook exits 0 over a failed arrival and SAYS the arrival did not complete; the opt-out announces itself; every step accounts for itself in one shape; an unreachable remote degrades the refs step and stops nothing.

NOTHING HERE STARTS A LANE. A spawn, a port and a wait per case would be paid on every battery run for a branch the live walk already exercises.

THE RED WAS OBSERVED, LATE AND HONESTLY. The build preceded the checks, so they were green from birth — which is exactly what observe-red exists to catch. The guarantee under test was inverted to exit 1, the case failed on an assertion, and the break was reverted.

## follow_up

- The idempotent path is demonstrated rather than tested, and tsp-the-arrival-in-one-act carries that procedure.
- The two demonstration specs owe their observation at run-demos, and one pass line is already known to be owed.

## anything_else

THE FIRST VERSION OF THIS FILE PASSED FOR THE WRONG REASON, and finding that was worth more than the file.

se-hook-arrive derives its root from its own location, deliberately, so cwd does not move it. The hook case therefore ran the arrival against the REAL repository: it placed a cage there, started a SECOND lane beside the one this walk was using, rewrote .se/se-call.mjs to point at it, and reset the walk to start on a 0.4 dial.

IT WENT GREEN THROUGHOUT, because a real product passes the runtime step and the hook exits 0 either way. A case that passes by testing the wrong tree reports coverage it does not have.

SE_ARRIVE_ROOT fixed it, the file got four times faster, and the incident is evidence for raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them: a cage was placed by something nobody expected to place one, and nothing noticed.
