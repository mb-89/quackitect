---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-ar-work-past-its-bound-says-it-is-working
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-work-past-its-bound-says-it-is-working at risk — the response hinges on el-mirror.
owner: the adjudicator
trigger: any slow lane call that registers no child job, which is the whole breaching class today
status: open
impact: the signal is sourced from the job registry, so it can only name spawned children, and the operations that actually breach the bound are in-process lane calls that never enter that map
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-work-past-its-bound-says-it-is-working
  - el-mirror
  - if-agent-harness-to-entrypoint
---

## A signal is built, and it is well built

`engine/mirror.ts` LINE 780 SUPPLIES `running: runningJob()` and
`engine/params.ts` line 279 renders it as `working, <secs>s`.
`tsp-work-past-its-bound-signals` carries both cases, including one asserting
the running signal does not take the panel over.

## It cannot see the operations that breach

`runningJob()` ITERATES `jobs`, and `jobs` is populated only by `startJob`
(`engine/run.ts` lines 214 to 227). AN IN-PROCESS LANE CALL NEVER ENTERS THAT
MAP.

THE BREACHING CLASS IS EXACTLY THAT CLASS. This iteration's own gate records it:
the harness-to-entrypoint bound was breached 93 times in one day, worst 20.5
seconds, typical 2 to 4, and every slow call carries a multi-kilobyte form
submit.

SO THE ASSUMPTION THE SIGNAL RESTS ON IS MEASURED FALSE. Not doubted — measured,
93 times, on the day this was written.

## Nothing computes the bound being passed

`renderRunning` DRAWS WHENEVER `running` IS PRESENT, from second zero, with no
comparison against any bound. The measure's clause — within one second of the
bound being passed — is owned by no element on the chart.

## The failure is silent, which is what makes it corrosive

THE PANEL SHOWS NOTHING, AND NOTHING READS AS NOTHING RUNNING. A person cannot
tell a nine-second form submit from a hang.

`gate-motivation` LINE 148 GIVES THE SHAPE: a nine-kilobyte evidence form takes
roughly nine seconds and a bare submit takes about one.

## And during the wait the surface is itself blocked

`engine/trace.ts` LINES 536 TO 537: the server answers nothing while that runs,
because the MCP endpoint shares the event loop. The signal would have to reach
the person through a surface the same call is holding.

## The tradeoff

SOURCING FROM THE JOB REGISTRY BUYS a correct, cheap, non-intrusive panel value
with no new plumbing, and it genuinely covers a long test battery. The price is
that it is blind to the class that actually breaches.

## What was not checked

THE PANEL REFRESH CADENCE. The signal reaches the person through a poll, and if
that poll is slower than a second the timing clause fails even for the jobs the
registry does see. Nobody has read the interval.
