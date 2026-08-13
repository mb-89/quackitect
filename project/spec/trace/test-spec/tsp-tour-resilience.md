---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-tour-resilience
type: "[[test-spec]]"
statement: A tour stop states an absence rather than inventing an example, and survives a missing highlight while recording the miss, verified by test over the tour machinery.
method: "test"
verifies:
  - "req-tour-admits-absence"
  - "req-tour-outlives-a-missing-highlight"
files:
  - "tests/tour.test.ts"
---

## Scope

The tour's failure modes — the two claims a demonstration cannot carry,
because each forces an absence on purpose. The tour's happy path is
demonstrated in [[tsp-tour-run]].

## Approach

Component level. BOTH claims are DEFINED ahead of their cases — no tour
tests exist; tests/tour.test.ts is the planned home and lands with the
tour build.

## Steps

The planned steps assert: a stop over zero instances of its kind stating
the absence and showing no invented example; a stop running without its
highlight and the miss recorded as a defect against the tour.
