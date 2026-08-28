---
unreachable_refs:
  - cand-the-refusing-run-with-recorded-conditions
minted_in: i37-training-iterations-a-disposable-iterati
id: if-benchmark-binding-to-report
type: "[[interface]]"
statement: The binding hands the report the three conditions no log holds and the window the run occupied, and the report reads nothing else from it.
source: el-benchmark-binding
destination: el-benchmark-report
carries:
  - flow-bound-run
  - flow-run-conditions
form: in-process call
bound: 1 second
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - cand-the-refusing-run-with-recorded-conditions
---

CROSSED TWICE PER RUN: once when the run binds, once when the report is filled.

## What crosses

The model, the reasoning effort and the harness, written at bind time because
no log holds them
([[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]).
Plus the window — when the binding opened and when it closed — so the report
knows which call-log entries are its own.

## What does not cross

Everything derivable. The rigor matrix hash, the se version, the rewind commit
and the iteration id are read from the repository rather than handed over. A
second copy of a derivable fact is a copy that goes stale.
