---
kind: report
story: sty-the-machine-picks-the-hands
spec: tsp-a-walk-opens-each-step-by-naming-the-hand-it-needs
performed: 2026-08-20
performed_by: agent
---

# Demonstration — the machine picks the hands

## What was demonstrated

An engineer opens a record without choosing a model for it, and a step opens by
naming the hand its own work needs.

## Where it was performed, and why that matters

AGAINST MODULES BUILT FROM THIS ITERATION'S CODE, in a fresh project root made
by the test harness — the same modules the shipped server loads, not a copy.

THE RUNNING LANE SERVER WAS NOT USED AND COULD NOT BE. It started before this
build landed and does not know the `as` argument exists; a run against it would
have shown the feature absent and read as a pass. That is recorded at
gate-implementation as an override.

## Procedure and what was observed

Six steps, run once, in order. Each line below is what the run printed.

1. RATE ONE STEP BY HAND. `onboard-retro` took
   `major_complexity: C4/R1` — judgement C4, reading R1. Nothing else in the
   matrix was rated, which is the shipped product's own state.

2. OPEN A RECORD AND PIN ITS COLUMN. `i1-demo`, pinned at `major`.
   NO MODEL WAS NAMED BY ANYBODY — not on a command line, not in the seed, not
   in the pin.

3. WALK IN. The session reached `iterations/i1/onboard-retro`.

4. THE STEP OPENED BY NAMING THE HAND. The pull carried:

   `hand = {"pair":{"judgement":"C4","reading":"R1"},"rung":"frame"}`

   The rung is `frame` — the strongest — because the corner rule takes the
   higher of the two figures and the judgement was C4. The pair rides beside
   it, so a reader who disagrees with the rung can see what it was derived
   from and choose otherwise.

5. THE SAME STEP, UNRATED, PUBLISHED NOTHING. A second record on a root where
   nothing is declared:

   `hand = undefined` — and the walk carried on regardless.

   No refusal reached the agent and no fallback was invented. That is
   `req-an-unmatched-rung-names-itself-and-publishes-no-driver` at the
   publishing end: nothing is better than a guess.

6. THE WALKER DELEGATED, AND THE RECORD SAID WHOSE WORK IT WAS. A lane call
   carrying `as: "guide"`, `relayed_by: "walker"`,
   `answered_by: "a-stronger-model"`, `named_driver: "frame"`:

   `part=guide relayed_by=walker answered_by=a-stronger-model named_driver=frame state=start claimed=["answered_by","part"]`

   The part is the GUIDE'S — the hand that did the work — and `relayed_by`
   names the walker that filed it. `claimed` says which two of the three
   coordinates are the caller's word rather than the server's observation.

## What the demonstration does not show

THE LANE STARTING ANYTHING. It does not, by design, and the inspection over
every path is where that is established rather than here.

THE DELEGATION ACTUALLY HAPPENING. Step 6 shows the RECORD a delegation leaves.
Whether a walker reads `rung: "frame"` and hands the step on is the walker's
obedience, and nothing in this build compels it —
`raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it` stands at
crippling.

A RATED MATRIX. One cell was rated by hand for this run. The shipped matrix has
none, and
`raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated`
carries the three acts that repay it.

## What the observation left behind

The run is reproducible from the procedure above using the project's own test
harness — a fresh root, a hand-rated cell, a pinned column, and a session
walked to the rated step. The harness file used to perform it was removed after
this report was written; the report is the artifact, and the same six
observations are held by cases in `tests/sizing-on-the-pull.test.ts` and
`tests/call-attribution.test.ts` that go red when their mechanisms are deleted.
