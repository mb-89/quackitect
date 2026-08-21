---
minted_in: i51
id: fn-run-a-governed-walk.hand-back-a-step-still-deciding
type: "[[function]]"
cluster: the-walk
statement: return control to the caller while a step's leaving judgment is still being reached, and keep that judgment attached to the step until it lands
satisfies:
  - req-a-leaving-check-does-not-hold-the-call
  - req-a-pending-verdict-is-recorded-against-its-state
inputs:
  - flow-instruction
  - flow-worktree
outputs:
  - flow-instruction
  - flow-step-standing
  - flow-work-under-way
controls:
  - the caller's own limit on how long it will wait, which this system cannot read
  - whether the step declares a leaving judgment at all
source_refs:
  - uc-leave-a-state-whose-check-is-still-running
  - vp-rigor-without-toil
---

## Rationale

TWO THINGS THE WALK DOES TODAY IN ONE BREATH, and they belong apart. Serving a
step and reaching a step's leaving judgment are joined by an await, and that
join is the whole defect.

WHY IT IS ITS OWN FUNCTION rather than part of serving a step. Serving a step
answers "what should be done here". This answers "may the walk leave, and has
that been settled yet". A design could reach the second answer in several ways
and still serve steps identically.

THE THIRD STANDING IS THE PART NO OTHER FUNCTION HOLDS. A step is passed, not
passed, or still deciding. Only the thing that started the judgment knows the
third one exists, which is why it keeps it rather than the route drawer or the
gate.

WHAT KEEPS IT SOLUTION-NEUTRAL. Nothing here says the judgment runs as a
process, that it is reached on this machine, or that the caller learns about it
by asking. A design that computes the judgment inline and caches it satisfies
this function, and so does one that hands it to something else entirely.

THE WORD "JUDGMENT" IS DELIBERATE. Calling it a script would name today's
mechanism, and a mechanism in a function is the winner chosen before anybody
compared.

## Why it sits in the-walk and not the-record-life

IT WAS FIRST PLACED IN the-record-life AND MOVED at i51's partition-functions.

The flows decide it. This function consumes and produces `flow-instruction`,
which is `serve-a-step`'s own flow, and `serve-a-step` sits in the-walk.

THE FIRST PLACEMENT FOLLOWED THE SUBJECT rather than the coupling. A leaving
check sounds like something about a record, and it is not: it is about whether
the walk may move.

ITS SIBLING WENT THE OTHER WAY. `account-for-work-out-of-sight` stayed in
the-record-life, because its flows come from `answer-with-tests` which lives
there. The two functions of one iteration land in two clusters, and the flows
said so before anybody argued.
