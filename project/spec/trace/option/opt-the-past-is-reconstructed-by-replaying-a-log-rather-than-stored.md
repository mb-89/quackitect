---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-past-is-reconstructed-by-replaying-a-log-rather-than-stored
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how the past state is made to stand up
found_by: analogy
statement: "The old state is rebuilt on demand from an append-only history rather than kept as a copy, so any point in the past is reachable at the cost of replay instead of storage."
source: "ANALOGY \u2014 event sourcing and point-in-time recovery in database systems, where a backup plus a write-ahead log reconstructs any instant"
---

## The abstract problem it answers

Put a system back into a state it held earlier, cheaply, many times.

## What transfers

Git already IS the append-only log, so the reconstruction is free. What
transfers is the DISCIPLINE around it: a reconstructed state is identified by
its point in the log, and every result carries that point.

## What does not

Databases replay to recover. Here the point is to reconstruct a state that is
known to be superseded, on purpose, which no recovery system wants to do.

## Mechanism

A commit identifier is the whole description of a past state. Nothing is
copied; the tree is materialised at that point and discarded after.
