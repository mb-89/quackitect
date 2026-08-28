---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-measurement-is-taken-on-a-specimen-that-is-destroyed-by-taking-it
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how the past state is made to stand up
found_by: analogy
statement: The thing measured is consumed by the measurement, so it is always a copy and never the original, and the copy is made from a specification rather than kept in stock.
source: ANALOGY — destructive materials testing, where a coupon is machined from the same batch and broken to learn about the batch
---

## The abstract problem it answers

Measure something without damaging the thing you care about.

## What transfers

The COUPON idea. A benchmark run destroys its tree, and that is a feature
rather than a cost, because the tree was made from a specification — a commit
identifier — and can be made again identically.

## What it argues against

Any design that measures by walking a REAL iteration. The archive is the batch;
the run is the coupon.

## Mechanism

The tree is materialised per run and discarded. Nothing persists but the
reading, and the specification that made the coupon is one commit id.
