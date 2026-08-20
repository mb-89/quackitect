---
minted_in: i36
id: fn-run-a-governed-walk.name-the-stopping-layer
type: "[[function]]"
cluster: the-walk
statement: report which layer ended an interrupted call, or that the layer is unknown
satisfies:
  - req-interrupted-call-names-the-stopping-layer
inputs:
  - flow-dispatched-call
outputs:
  - flow-interruption-report
---

## Rationale

A cancelled call, a lost transport, a restarted server and a stop-hook
action all look the same from where the next pull stands: a call that did
not return a normal result. Recovery aimed at the wrong one repeats the
interruption instead of fixing it.

THIS DIAGNOSES; IT DOES NOT PREVENT. Preventing a premature stop is
`hold-the-session-through-work`. This function only ever reports what
already happened, from evidence it can point at — never an inferred cause
it did not observe.
