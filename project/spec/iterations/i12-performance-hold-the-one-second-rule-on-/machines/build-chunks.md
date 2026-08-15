---
steps:
  - id: reporter-wiring
    statement: "one reporter builder, shared by the battery and the scoped run, so the two cannot carry different reporters again"
    depends_on: []
    realization: code
  - id: records-home
    statement: "the spawner tells the reporter where to write, and every run prints where that was"
    depends_on: [reporter-wiring]
    realization: code
  - id: timing-report
    statement: "a run reports how many cases it timed, and names the gap when it timed fewer than it ran"
    depends_on: [reporter-wiring]
    realization: code
  - id: fanout-cap
    statement: "the test fan-out is sized from the machine at run time, leaving the engine a core to answer on"
    depends_on: []
    realization: code
  - id: container-choose
    statement: "a container holding several open iterations offers them, rather than entering the first one"
    depends_on: []
    realization: code
  - id: survey-open-only
    statement: "the survey's open list excludes a shipped iteration"
    depends_on: []
    realization: code
---

# The build plan

Six chunks. Two lenses shaped the order, and both are recorded so a reviewer
can judge the order rather than only the pieces.

## RISK FIRST, which decides what goes at the front

The risk here is not that a piece proves infeasible. It is that the RANKING
choosing what to build is derived from numbers nobody can refresh.

Every other item in this record was chosen by that ranking, so the instrument
is the riskiest thing in the plan. `reporter-wiring` goes first, and
everything the ranking would justify waits behind it.

## PARALLEL FLOW, which decides the shape

Four lots, and every later lot leans on exactly one earlier lot.

- THE INSTRUMENT: reporter-wiring, then records-home and timing-report.
- THE FAN-OUT: fanout-cap. Leans on nothing.
- THE CONTAINER: container-choose. Leans on nothing.
- THE SURVEY: survey-open-only. Leans on nothing.

FOUR CHUNKS CAN START AT ONCE: reporter-wiring, fanout-cap, container-choose
and survey-open-only. That is the fan-out the lots exist to buy, and it is
wider than the chain is deep.

## What each chunk turns green

- reporter-wiring: the scoped run's reporters carry the timing reporter, it
  exists on disk, and the two paths differ only in which output a person
  reads.
- records-home: the reporter is told where to write rather than guessing.
- timing-report: a run that timed less than it ran says so in its verdict.
- fanout-cap: the cap leaves a core and never asks for fewer than one worker.
- container-choose and survey-open-only: their cases live in
  tsp-record-lifecycle.

## Why records-home was not in the first plan

It was found DURING the build, and it is the chunk that actually closes the
defect.

The first three chunks made the scoped run attach the reporter, which was the
gap the requirement named. Running the battery then printed where it records:

    timings home: ...\.worktrees\i12-...\.se

While an iteration is bound, the root is that iteration's WORKTREE, and the
lane reads the machine root. So a run wrote 1301 rows into a directory nothing
opens, and every earlier reading of that file was of a stale one.

Attaching the reporter without this chunk would have been a fix that changed
nothing observable, which is the worst kind.

## What is deliberately not here

NO SPLIT OF THE BATTERY'S TALLEST TEST FILE. The record's plan names it, and
the figure that makes it tallest is from 2026-08-14 and could not be
refreshed. It waits for a measurement taken after this build.

NO WORKER POOL, and the ruling is not this record's to make. i27 considered
one and replaced it with the heavy-slot lease in `core-process`, on the
owner's ruling of 2026-08-14. `fanout-cap` caps what already forks; it does
not pool anything.
