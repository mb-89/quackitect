---
minted_in: i37-training-iterations-a-disposable-iterati
id: if-benchmark-guard-to-report
type: "[[interface]]"
statement: "The guard hands the report the outcome of the run's deliberately forbidden request, and a report without it is not a result."
source: el-benchmark-guard
destination: el-benchmark-report
carries:
  - flow-bound-run
  - flow-guard-proof
form: in-process call
bound: 1 second
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - cand-the-refusing-run-with-recorded-conditions
---

CROSSED ONCE PER RUN, and it is the crossing that makes a report believable.

## What crosses

Whether the forbidden request was refused, and the clause it refused under.

## Why it is a separate crossing rather than a field

A guard that reports on itself through the same path it guards could report
success while being absent. The proof travels from the guard to the report as
its own handover, so a missing proof is a missing crossing rather than an empty
field.

## The rule it carries

A run whose forbidden request SUCCEEDED is discarded rather than reported. A
guard nobody exercised is indistinguishable from a guard that is not there.
