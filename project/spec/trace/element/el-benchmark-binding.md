---
minted_in: i37-training-iterations-a-disposable-iterati
id: el-benchmark-binding
type: "[[element]]"
statement: "Opens and holds a benchmark run: takes the iteration a person named or the least recently walked one, finds the commit before that iteration started, exports the content subtree there, and proves its own ancestry test before anything else runs."
kind: new
realization: make
group: the-benchmark-run
implements:
  - fn-the-benchmark-run.choose-the-iteration-to-re-walk
  - fn-the-benchmark-run.locate-the-rewind-point
  - fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run
source_refs:
  - raid-dec-a-benchmark-rewinds-content-and-never-the-machine
  - raid-dec-a-run-that-cannot-establish-its-guard-never-binds
  - cand-the-refusing-run-with-recorded-conditions
---

The binding is the whole lifetime of a run. Everything else exists only while
it stands, and dies with it.

## What it does, in order

- Takes an iteration id, or reads the reports folder for the least recently
  benchmarked one.
- Finds that iteration's `started` commit by its message and takes its parent.
- Exports `project/spec` at that commit into a fresh directory.
- Exercises the ancestry test and REFUSES TO BIND if the test cannot be run
  ([[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]).
- Writes the three conditions no log holds: the model, the reasoning effort and
  the harness.

## What it does not do

It never touches `project/deliverable`. The engine measured is the current one
([[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]).

## How it is reached

A LANE VERB, and this is where that question is finally settled after three
deferrals. The alternatives were a desk door and nothing at all.

- A DESK DOOR was rejected: the desk recommends and the person routes, and a
  benchmark run is not a vehicle for work. It would put a measuring instrument
  in the same list as expeditions and iterations.
- NOTHING AT ALL was rejected: a run has to bind, and binding is an act that
  can refuse. An act that can refuse needs a caller the refusal can reach.

So `se_benchmark {iteration?, stop_at?}` opens a run and `se_benchmark {stop:
true}` ends one. It is one verb because a run has one lifetime.
