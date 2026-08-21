---
minted_in: i51
id: opt-the-estimate-may-rise-and-says-so
type: "[[option]]"
statement: a reported time remaining is allowed to grow between two asks, and the report treats a rise as an ordinary revision rather than hiding it behind a counter that only falls
cluster: cluster-the-estimate
found_by: analogy
source: "air traffic and scheduled transport, where an arrival estimate is revised in both directions in public — and this project's own meth-derive-criteria, which already rules the same way for its question counter"
---

## Mechanism

IN THE SOURCE DOMAIN. An arrival estimate is published, then revised as the
journey proceeds. It moves both ways. A flight that hits headwinds shows a
later arrival, and nobody treats the board as broken.

THE MECHANISM IS THAT THE ESTIMATE IS A CURRENT BELIEF rather than a promise
made at departure. Its authority comes from being recomputed, not from having
been right the first time.

TRANSFERRED HERE. The figure is recomputed from what the work has done so far.
Where the work slows, the remaining time grows, and the entry reports the
larger number.

## Why it matters more than it sounds

A COUNTER THAT ONLY FALLS IS LYING about a cost that depends on things nobody
has measured yet. It buys comfort with accuracy, which is the trade this
iteration's honesty rule refuses everywhere else.

AND THIS PROJECT HAS ALREADY RULED THE SAME WAY. `meth-derive-criteria` says
of its own remaining-questions count that a run of misses raises the observed
cost, so the number goes up, and that it must be shown rising rather than
hidden.

Two mechanisms, two milestones apart, same answer. That is either a house rule
nobody has named or a coincidence worth checking.

## What survived the translation

- THE REVISION IN BOTH DIRECTIONS. Kept whole.
- THE PUBLIC RECOMPUTE. Kept: the basis field says what the figure came from,
  so a reader can see it was recomputed rather than remembered.

## What deliberately did not

- THE SCHEDULE. Transport estimates start from a published plan, and a delay
  is measured against it. We have no plan to be late against, so there is no
  notion of "behind schedule" here.
- THE OPERATOR. Somebody in the source domain decides when a revision is big
  enough to announce. Nothing here decides that, and nothing should: the
  caller asks and gets the current belief.

A transfer with no losses was not a transfer, and these are the two.

## What it would cost

Nothing structural. The figure is already recomputed on each ask under
`opt-the-figure-and-its-basis-are-two-fields`.

What it costs is a stated expectation. A caller that reads a rise as a fault
will report a bug, so the design says up front that a rise is ordinary.
