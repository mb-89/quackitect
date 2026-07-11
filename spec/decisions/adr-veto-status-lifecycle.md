---
id: adr-veto-status-lifecycle
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: A status-field decision lifecycle (proposed/accepted/deprecated/superseded) is scrapped: it duplicates the gate ledger's state machine — classification derives from graph facts instead (decision model v2, 2026-07-03).
class: review
killer: false
---
## Rationale (not load-bearing)
A decision could carry a status field with its own lifecycle.
That lifecycle would duplicate the gate ledger's state machine.
The ledger already tracks proposed, accepted, and retired states through blesses.
Decision model v2 derives the class from graph facts instead: an edge to the scrap sink is a veto or defer, an incoming supersedes edge is superseded.
A hand-set status would be a second source of truth that could drift from the graph.
