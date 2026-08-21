---
minted_in: i51-work-running-out-of-sight-reports-itself
id: opt-report-a-window-rather-than-a-point
type: "[[option]]"
statement: the entry reports a range with a lower edge a caller can safely wait, rather than a single number that is precise and wrong
cluster: cluster-the-estimate
found_by: analogy
source: "parcel logistics and appointment scheduling, where a delivery window replaces a point estimate and its width carries the uncertainty"
---

## Mechanism

IN THE SOURCE DOMAIN. A parcel is not promised at 14:07. It is promised
between noon and four, and the width of that window is how the operator
communicates what it does not know.

THE MECHANISM IS THAT UNCERTAINTY RIDES IN THE SHAPE OF THE ANSWER rather than
in a caveat beside it. A wide window and a narrow window are both honest, and
the reader learns something from which one arrived.

TRANSFERRED HERE. An entry reports "at least forty seconds, probably under two
minutes" rather than "about ninety seconds". The lower edge is what a caller
may safely wait before asking again.

## Why the lower edge is the part that works

A CALLER MUST PICK ONE NUMBER WHATEVER IT IS TOLD. An agent given a range and
told to wait will wait for something, so a range with no guidance is a point
estimate with extra reading.

THE LOWER EDGE IS THE USABLE ONE. Waiting at least that long is never wasted:
the work genuinely cannot be finished sooner. Waiting the upper edge risks
sitting idle after the work has landed.

## What survived the translation

- THE WIDTH AS THE UNCERTAINTY SIGNAL. Kept whole, and it is the whole point.
- THE COMMITMENT AT ONE EDGE. Kept, and moved: logistics commits to the LATE
  edge because a customer waiting is the failure. Here the failure is polling,
  so the commitment moves to the EARLY edge.

## What deliberately did not

- THE FIXED WINDOW. A delivery window is set once and rarely revised. Ours is
  recomputed on every ask, which `opt-the-estimate-may-rise-and-says-so`
  requires.
- THE PENALTY. Missing a delivery window costs the operator something. Nothing
  here penalises a bad window, so nothing keeps the width honest except the
  basis field.

That second loss is the serious one and it is stated rather than glossed.

## What it would cost

Two numbers where the packet asked for one, and a rule for computing the
lower edge that is genuinely safe. A lower edge that is sometimes too high is
worse than a point estimate, because a caller trusted it.

## What it does not solve

It does not help the no-basis case at all. A piece of work with nothing to
compute from cannot produce a window either, and the honest answer stays "no
estimate".
