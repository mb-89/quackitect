---
minted_in: i36
id: flow-interruption-report
type: "[[flow]]"
statement: which layer ended an interrupted call, or that the layer is unknown
kind: signal
crosses: out
source_refs:
  - req-interrupted-call-names-the-stopping-layer
---

## It crosses OUT, to whoever is watching the walk

The report is read by the person or agent watching the session, which
draw-context places outside the system boundary. Nothing inside consumes it.
