---
minted_in: i37-training-iterations-a-disposable-iterati
id: el-benchmark-binding
type: "[[element]]"
statement: "Opens and holds a benchmark run: takes the iteration a person named or the least recently walked one, finds the commit before that iteration started, stands a tree whose history ENDS there with today's method laid over yesterday's records, and writes the conditions no log can recover."
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

## Corrected by the M6 spikes, 2026-08-19

TWO THINGS IN THIS ELEMENT'S FIRST STATEMENT WERE WRONG, and both were found by
running rather than by review.

### The tree is fetched, not exported

`git archive` gives content with no `.git` at all, so every git verb is dead
inside the tree — including the ones an agent legitimately uses to read the
past.

A DEPTH-1 FETCH GIVES BOTH: the working tree and a history that simply ENDS at
the rewind point. Measured on i33: 1723 files, depth 1, and `git rev-parse` on
i33's own start commit does not resolve because the object is absent.

TWO COMMANDS, and the first is not optional:

    git update-ref refs/bench/<id> <rewind-commit>
    git fetch --depth 1 <source> refs/bench/<id>:refs/heads/bench

A BARE OBJECT ID CANNOT BE FETCHED without `uploadpack.allowAnySHA1InWant`.
The rewind commit has to be named as a ref first.

### The rewind covers records, never method

`project/deliverable` and `project/guidance` come from TODAY. A whole-tree
rewind fails to compile
([[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]).

### And the guard it proves is no longer a test

The ceiling was a checked ancestry test when this element was written. The
structural ceiling now stands on probed ground, so there is nothing per-request
to prove: the object a run must not reach is not in the tree.

WHAT SURVIVES OF THE PROOF. One deliberately forbidden request per run, recorded
on the report — not to show a guard held, but to show the tree was truncated as
intended.
