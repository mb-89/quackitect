---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-conditions-are-recorded-because-they-cannot-be-recovered
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a result carries the conditions it was taken under
found_by: heuristic
statement: "Anything about a run that cannot be re-derived later is written down at the moment it is true, and anything derivable is left to be derived."
source: "HEURISTIC \u2014 if it must be remembered, it must be recorded"
---

## What it sorts

It splits the report's conditions into two kinds, which no state has done yet.

- DERIVABLE LATER: the rigor matrix hash, the se version, the rewind commit,
  the iteration id. All are in the repository or in the call log.
- RECOVERABLE FROM NOWHERE: the model, the reasoning effort and the harness.
  These are properties of a session, and when the session ends they are gone.

## Why that matters for the trim

find_without asked whether stating the conditions could be absorbed into
deriving the cost. This heuristic says the absorbable half is the half that was
never the problem.

## Mechanism

The run writes the three unrecoverable conditions at bind time and derives the
rest at report time.
