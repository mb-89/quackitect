---
id: se.adr-veto-status-lifecycle
kind: decision
statement: A status-field decision lifecycle, proposed, accepted, deprecated, superseded, is scrapped. It duplicates the gate ledger's state machine. Classification derives from graph facts instead (decision model v2, 2026-07-03).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
p3_note: classification from graph facts
---

## Rationale (not load-bearing)
A decision could carry a status field with its own lifecycle.
That lifecycle would duplicate the gate ledger's state machine.
The ledger already tracks proposed, accepted, and retired states through blesses.
Decision model v2 derives the class from graph facts instead: an edge to the scrap sink is a veto or defer, an incoming supersedes edge is superseded.
A hand-set status would be a second source of truth that could drift from the graph.
