---
steps:
  - id: one-rule-four-conversations
    statement: spike raid-asm-one-rule-fits-all-four-conversations-whatever-their-caller-count - timebox one script and its printed output
    depends_on: []
    realization: document
  - id: a-usable-reason
    statement: spike raid-asm-an-author-refused-at-write-time-states-a-usable-reason - timebox reading every departure the tree holds
    depends_on: []
    realization: document
  - id: a-demanded-reason
    statement: spike raid-asm-a-demanded-reason-is-a-considered-reason - timebox one sweep of every reason-bearing list in the tree
    depends_on: []
    realization: document
  - id: departures-through-the-lane
    statement: spike raid-asm-every-write-that-adds-a-departure-passes-through-the-lane - timebox one search for the channels that bypass a path
    depends_on: []
    realization: document
  - id: the-door-pays-for-itself
    statement: spike raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself - timebox one script counting the write shapes
    depends_on: []
    realization: document
  - id: the-sample-carries
    statement: spike raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three - timebox one script over the remaining modules
    depends_on: []
    realization: document
  - id: the-sweep-cost-split
    statement: spike raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it - timebox three timed runs of the sweep's own phases
    depends_on: []
    realization: document
  - id: the-write-budget
    statement: spike raid-asm-a-bound-check-runs-inside-the-write-budget - timebox one measured write with a corpus-reading check on it
    depends_on: []
    realization: document
---

# The spike drawing

One state per unknown picked at rank-unknowns. Eight were picked from a chart
of well over a hundred standing entries.

## They run in parallel

No spike depends on another's answer, so `depends_on` is empty on all eight.
The join waits for every one.

## Each timebox is a piece of work, never a clock reading

THE METHOD ASKS FOR A TIMEBOX and the craft rules forbid a duration nobody
measured. So each statement bounds the work rather than the wall clock: one
script, one search, one sweep, three timed runs.

A SPIKE THAT OVERRUNS ITS BOUND REPORTS WHAT IT LEARNED AND STOPS. That is the
point of a timebox, and an answer of "not settled inside the box" is a result
rather than a failure.

## What each spike is for

### The kill criterion

- `one-rule-four-conversations` — write the day-one departure list for the
  6-caller door and the 81-caller door, and compare them. A disk list holding
  more than half the governed set means the rule governs nothing.

### Whether a written reason is worth anything

- `a-usable-reason` — read every departure the tree actually holds and judge
  whether a later reader could act on it. The sample is one line today, which
  is the whole problem.
- `a-demanded-reason` — the same question asked of every list in the tree that
  already demands a reason. It is broader than the one above and it existed in
  the register before this record started.

TWO SPIKES, ONE QUESTION. They are kept apart because their evidence differs:
one reads this rule's departures, the other reads every rule's.

### The hole in the guard

- `departures-through-the-lane` — find the channels that write without a path
  the guard can judge. One counterexample already stands.

### Whether the door pays

- `the-door-pays-for-itself` — count the write shapes across the 117 direct
  sites and say whether they are a defect or a shape somebody chose.
- `the-sample-carries` — run the same count over the 53 modules the original
  sample skipped, and see whether the 42-to-22 split holds.

### Whether the sweep can hold another rule

- `the-sweep-cost-split` — time the sweep's phases separately and say how much
  of the runtime is per node against per rule. Three measurements already say
  the total is growing and steepening.
- `the-write-budget` — put a corpus-reading check on one write and measure it.
  This has never been exercised, and the winning design is shaped so it never
  has to be.

## What a spike produces

A RECORDED ANSWER, in the state's own evidence: what was run, what came back,
and whether the entry it aimed at holds, is false, or is still unsettled.

THE ENTRY'S `probe` FIELD IS WHERE THE RESULT LIVES, on the node rather than in
the form. A probe result belongs to the assumption, not to whichever iteration
happened to run it.
