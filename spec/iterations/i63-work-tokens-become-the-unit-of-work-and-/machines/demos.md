---
steps:
  - id: carry-a-finding-without-stopping
    statement: demonstrate sty-carry-a-finding-without-stopping against the shipped system - a real defect that breaks nothing is recorded and the walk carries on
    depends_on: []
    realization: document
  - id: a-smaller-model-walks-a-record
    statement: demonstrate sty-a-smaller-model-walks-a-record against the shipped system - a night's work on a cheap hand comes back as signed states
    depends_on: []
    realization: document
---

# The demo drawing

One state per MUST story this iteration touched. Two stories were changed by
this work, and each gets its own demonstration.

THE OTHER TWO STORIES THIS ITERATION TOUCHED ARE `should`, not `must`. Coming
back after a week and watching the walk live are both wanted and neither is
demanded, so neither earns a demonstration state here.

## Why these two

CARRYING A FINDING WITHOUT STOPPING is what the work token became this
iteration. The story asks that a real defect which breaks nothing gets recorded
and the walk continues. Everything the token model changed serves that sentence
directly.

A SMALLER MODEL WALKING A RECORD is what the ladder collapse serves. Complexity
became a routing key that decides which hand a piece of work is given to, and
that decision is the whole of what lets a cheaper hand walk safely.

## What each state does

- PERFORM the story's procedure against the shipped system, observed end to end.
- WRITE `reports/rpt-<story>.md` in this record: the spec, the date, who
  performed it, what was observed, and what the observation left behind.
- FILL the story's own evidence with the report reference and what it shows.

## Both are independent

Neither demonstration needs the other, so both hang off start and the join waits
for the pair.

## What a demonstration may NOT do

It may not report a procedure it did not perform. Where a story cannot be
demonstrated on the machine this record ran on, the report says so and says
which part is unobserved. A named absence is a result; a report of a run that
did not happen is fabrication.
