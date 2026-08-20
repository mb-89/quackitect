---
minted_in: i37-training-iterations-a-disposable-iterati
id: el-benchmark-report
type: "[[element]]"
statement: "Turns a finished or abandoned run into one committed node: the cost per state derived from the call log, the conditions it was taken under, and where the walk actually stopped."
kind: new
realization: make
group: the-benchmark-run
implements:
  - fn-the-benchmark-run.derive-what-the-walk-cost
  - fn-the-benchmark-run.state-the-conditions-of-the-run
  - fn-the-benchmark-run.fill-the-report-and-say-where-the-run-stopped
source_refs:
  - raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds
  - req-a-benchmark-report-carries-the-conditions-of-its-run
  - raid-dec-the-agent-is-told-it-is-walking-a-benchmark
---

The run is thrown away. This is what survives it.

## What it derives

Time and lane calls per state, forms filled, forms refilled after a refusal,
refusals counted by clause, states visited and re-entered. All of it from the
call log, which already stamps `ts`, `tool`, `ok`, `outcome` and
`duration_ms` per dispatch.

## What it does not derive

The model, the reasoning effort and the harness. Those are written when the run
binds, because no log holds them
([[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]).

## What it is

A `benchmark-run` item template at `spec/benchmarks`, discovered by
being written — `engine/vocabulary.ts` scans the items folder, so no engine
change is needed.

## What it always says

That it measures process overhead and never production behaviour
([[raid-dec-the-agent-is-told-it-is-walking-a-benchmark]]). The number is a
floor rather than an estimate.

## Two fields that are not numbers

Where the run was told to stop, and where it actually stopped. A run that died
still leaves a result, and where the machine stopped an agent is the thing this
whole iteration exists to measure.
