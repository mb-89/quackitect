---
steps:
  - id: does-a-left-check-survive-its-call
    statement: "SPIKE, timebox 60 minutes: start a step's leaving check, let the call answer, then read the verdict. Do it on each supported platform, and name the platforms not reached."
    depends_on: []
    realization: experiment
  - id: what-a-fresh-session-sees
    statement: "SPIKE, timebox 45 minutes: leave a step still deciding, end the session, open a new one, and report exactly what the walk says about that step from the repository alone."
    depends_on: []
    realization: experiment
  - id: does-a-standing-hold-still
    statement: "SPIKE, timebox 45 minutes: read one step's standing twice across a running judgment and report what changed, what the record said at each read, and whether a reader could tell the window was open."
    depends_on: []
    realization: experiment
---

# The spike drawing

One timeboxed spike per unknown seeded at rank-unknowns. Three were seeded, they
are independent, all three hang off start, and the join waits for every one.

THE FIRST ONE CAN KILL THE DESIGN. If a left-running check does not survive its
call on a supported platform, the walk answers fast and then waits for a verdict
that never comes. That is worse than the freeze it replaces.

THE OTHER TWO SHAPE THE BUILD RATHER THAN THE CHOICE. Both ask what a reader
sees during or after the window the third standing opens, and both have answers
the build can adopt.

## does-a-left-check-survive-its-call

[[raid-asm-a-check-left-running-survives-on-every-platform]], crippling and
plausible.

WHAT IS ASSUMED. That work left running after its call answered runs to
completion, and that its verdict is readable afterwards.

WHAT IS ALREADY KNOWN. The entry records a partial probe on 2026-08-21: handed-
off work survived its call on Linux for ninety seconds and its verdict was
readable. Two things were not reached.

- The leaving-check path itself was never exercised. What was measured was a
  handed-off test run, which is a different code path.
- No platform other than Linux was touched.

WHAT WOULD SETTLE IT. A verdict that lands on every supported platform. A
verdict that never lands names the platform where this design cannot be built.

## what-a-fresh-session-sees

[[raid-ar-walk-resumes-from-repo]], fatal and expected.

WHAT IS UNKNOWN. What the walk says about a step whose leaving judgment was
still running when the session ended.

WHY IT IS FATAL. `req-walk-resumes-from-repo` says the walk is served from the
recorded position using the repository content alone. A word that only a live
process can settle is not in the repository.

WHAT WOULD SETTLE IT. The actual answer a fresh session gives. Three outcomes
are worth telling apart: it says still deciding and offers nothing, it re-runs
the judgment by itself, or it refuses to move.

THE PROBE IS CHEAP AND THE ANSWER ROUTES M7. Whichever of the three it turns out
to be, the build's rule follows from it rather than from an argument.

## does-a-standing-hold-still

[[raid-ar-a-machine-decision-repeats]], crippling and plausible.

WHAT IS UNKNOWN. Whether a reader can tell an open window from a settled answer,
using only what is written down.

WHY IT MATTERS. The requirement's own `breaks_if_removed` says two machines given
the same record must not reach different answers with nothing to say why. During
the window they can.

WHAT WOULD SETTLE IT. Two reads across a running judgment, with what the record
held at each read. If the record carries something that marks the window open, the
risk shrinks to a reading rule. If it carries nothing, the build owes a recorded
start time.

## What was not seeded, and why

FIVE MORE ENTRIES WERE CANDIDATES and none earns a spike. Each fails one of the
three filters.

- [[raid-risk-a-narrower-test-scope-misses-a-break]] — corrosive and plausible.
  Already exercised: verification runs the full battery, which is exactly the
  trigger the entry names.
- [[raid-risk-a-time-remaining-is-believed-more-than-it-deserves]] — only living
  can answer it. A timeboxed probe cannot measure what a person believes.
- [[raid-asm-a-first-run-has-timings-to-estimate-from]] — probed on 2026-08-21 by
  replaying this session's own 175-file battery.
- [[raid-asm-work-under-way-records-progress-before-it-ends]] — probed in the same
  pass, which is where the progress file was found.
- [[raid-asm-the-callers-limit-is-longer-than-a-second]] — not spikeable from
  inside. The caller's limit belongs to the harness and this system cannot read
  it, which the assumption's own statement says.
