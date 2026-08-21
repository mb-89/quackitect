---
minted_in: i51
id: opt-acknowledge-inside-a-second-then-report-every-minute
type: "[[option]]"
statement: work that will run long emits an acknowledgement inside the first second and then reports its progress at least once a minute, so the caller is never left guessing and never has to ask
cluster: cluster-the-handback
found_by: prior-art
source: "v1 at ref main, product/quackitect/project_types/default/guides/responsiveness.md lines 4 and 11 to 13 — the predecessor, read as the prior-art card's step 0 demands"
---

## Mechanism

TWO BOUNDS RATHER THAN ONE, and they answer different questions.

- THE ACKNOWLEDGEMENT BOUND. Every interaction gives visible feedback within
  one second. Where the work takes longer, an acknowledgement is emitted first,
  inside that second. The predecessor's own example is "started computing…".
- THE PROGRESS BOUND. A long-running task reports progress at least once per
  minute.

AND A RULE ABOUT WHERE TO OVERACHIEVE. The more frequent and interactive an
interaction is, the more it should beat the bound by whatever is free.

## Why this is a predecessor finding and not a new idea

THE PRODUCT ALREADY WROTE THIS DOWN AND DID NOT CARRY IT FORWARD. The whole
design this iteration is reaching for sits in fifteen lines of a v1 guide,
including the acknowledgement-first rule that is the answer to the frozen
pull.

It binds v1 itself AND the output v1 produces, so it was never a note about one
screen.

## What adopting it would look like here

The acknowledgement bound is already `req-call-answers-in-one-second` and
`req-a-leaving-check-does-not-hold-the-call`. Nothing new is needed for that
half.

THE PROGRESS BOUND IS NOT IN THIS ITERATION'S REGISTER AT ALL. Nothing here
says how OFTEN a running piece of work must have something new to say. The
report is asked for and answers; nothing demands the answer has moved.

That gap is real, and `uc-report-every-piece-of-work-out-of-sight` extension 6a
is where it surfaced from the other side: a figure that does not move between
two asks.

## What our context breaks

THE MINUTE IS SIZED FOR A PERSON WATCHING. An agent that asked a minute ago and
comes back is not watching a screen, and a minute of silence costs it nothing
if it was working.

SO THE BOUND MAY BE THE WRONG SHAPE HERE while the rule behind it is right.
What the caller needs is that the answer MOVES, not that it moves on a clock.

## What it would cost

One more demand, and it is cheap: a running piece of work whose reported figure
has not changed since the last ask says which measurement is not advancing.
