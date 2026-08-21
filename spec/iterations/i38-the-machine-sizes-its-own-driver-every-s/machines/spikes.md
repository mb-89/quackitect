---
steps:
  - id: can-a-receiver-act
    statement: "SPIKE, timebox 90 minutes: can anything downstream of the lane act on a published driver — as a rung, and as a model name? Answer both or say which was not reached."
    depends_on: []
    realization: experiment
  - id: what-the-transport-carries
    statement: "SPIKE, timebox 45 minutes: open the transport and the harness registration and report what the lane can learn about the answering model without asking the caller."
    depends_on: []
    realization: experiment
  - id: does-a-declared-rung-hold-still
    statement: "SPIKE, timebox 60 minutes: rate a sample of matrix cells twice at a distance and measure the disagreement between the two ratings."
    depends_on: []
    realization: experiment
---

# The spike drawing

One timeboxed spike per unknown seeded at rank-unknowns. Three were seeded, they
are independent, all three hang off start, and the join waits for every one.

THE FIRST ONE CAN KILL THE DESIGN AND THE OTHER TWO CANNOT. That is not a reason
to run it first — they are parallel — but it is the reason a "no" from it is
worth more than a "yes" from either of the others.

## can-a-receiver-act

`raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all`, crippling
and expected.

WHAT IS ASSUMED. That publishing a driver reaches somebody who can use it. Every
quality scenario the declared architecture addresses rests on it.

WHAT IS KNOWN. `nbr-the-driver-that-performs-the-spawn` says the receiver reads
and cannot act, and that node was rewritten in this record because its first
version claimed otherwise. `se-start.ts` spawns the lane and proves it answers
before launching an agent; `se-pty.ts` runs an agent inside a pseudo-terminal
with a live read-write channel.

THE PROBE. Take one of those paths and try to make a published value change what
gets started. Do it for a RUNG and for a MODEL NAME, because the second settles
the owner's ruling as a side effect: if nothing can act on a model name either,
the roster is a file maintained for nobody.

WHAT COUNTS AS A RESULT. A working path, or a specific reason there is none —
which line, which process boundary, what would have to change. "Still cannot" is
a result and is recorded as carefully as a yes.

## what-the-transport-carries

`raid-ar-the-actor-is-recorded-where-the-call-is-served`, corrosive and CERTAIN.

WHAT IS ASSUMED. That the lane cannot learn which model answered a call except by
asking the caller. `req-every-call-records-the-model-that-answered-it` demands
the value be marked self-reported "wherever the lane cannot obtain the value
independently", so the scope of that mark depends entirely on this.

WHY IT IS A SPIKE AND NOT A READING. This record has twice asserted what the
transport carries without opening it, and both assertions were wrong in the same
direction — toward the lane knowing less than it does.

THE PROBE. Open the transport, the harness registration and whatever the lane
records about the process it was spawned by. Report what is there.

WHAT COUNTS AS A RESULT. A list of what the lane can obtain independently today,
and therefore which part of the mark is permanent and which is temporary.

## does-a-declared-rung-hold-still

`raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so`,
corrosive and expected.

WHAT IS ASSUMED. That a number typed by hand stays honest without a mechanism
holding it there. The declared architecture types 308 figures — 154 active cells,
two figures each.

WHAT IS KNOWN AGAINST IT. The scheduler literature measured sixty-nine per cent
of requested CPU unused across more than twenty-three thousand production
clusters, with the cause given as declarations nobody updates.

THE PROBE. Rate a small sample of cells twice, at a distance, and measure the
disagreement. THIS IS THE ONLY ONE OF THE THREE THAT NEEDS NO NEW MACHINERY —
the corpus is already there.

WHAT COUNTS AS A RESULT. A disagreement rate on a stated sample, with the two
ratings kept so a third reader can check them.

## What no spike covers

NOTHING HERE PROBES WHETHER A STRONGER HAND DOES BETTER WORK ON A HARDER STEP.
Probe 3 tried at M4 and could not: the only paired walks in the corpus are forms
and their own repairs.

EVERY CANDIDATE ON THE CHART LEANS ON IT and this iteration will ship without
having tested it. Said here rather than left as a gap a reader has to notice.
