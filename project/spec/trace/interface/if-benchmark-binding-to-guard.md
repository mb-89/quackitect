---
minted_in: i37-training-iterations-a-disposable-iterati
id: if-benchmark-binding-to-guard
type: "[[interface]]"
statement: "The binding hands the guard the rewind commit and the fact that a run is open, and the guard answers every later resolution against them."
source: el-benchmark-binding
destination: el-benchmark-guard
carries:
  - flow-bound-run
form: in-process call
bound: 1 millisecond
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - cand-the-refusing-run-with-recorded-conditions
---

CROSSED ON EVERY RESOLVED COMMIT, REF AND PATH for the length of a run, so
its bound is the tightest in this iteration.

## What crosses

One value in one direction: the rewind commit, plus the fact that a run stands.
Nothing crosses back.

## Why the bound is a millisecond

The guard sits under every read, search, glob and list the walk makes. A
benchmark that slowed the walk it was measuring would measure itself, which is
the one failure this interface cannot be allowed to have.

## What it must never do

Fail open. Where the guard cannot answer, the crossing refuses
([[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]).
