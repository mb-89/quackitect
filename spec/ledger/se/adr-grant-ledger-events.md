---
id: se.adr-grant-ledger-events
kind: decision
statement: A standing grant is a ledger event pair, not a config file.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0022_engine_laws
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: agent-proposal at i22 M4
v1_provenance_adjudicated_by: grant-covered at i22 M4; the morning review confirms
---

## Rationale (not load-bearing)
A grant is an adjudication fact, so it lives where adjudication facts live: as
ledger events (grant-open with scope and expiry; grant-close with the collection).
The rejected alternative - a grant file in config - is editable state outside the
event chain; the no-bypass maxim falls. In-scope blesses stamp the grant id on
their existing event, so the collection is a query, not a second store.
model-grant-lifecycle carries the state contract. Shapes go-grant-store.
