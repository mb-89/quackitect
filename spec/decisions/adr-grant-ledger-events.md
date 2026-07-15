---
id: adr-grant-ledger-events
type: adr
decided_in: i0022_engine_laws
adjudicated_by: user
statement: A standing grant is a ledger event pair, not a config file.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal at i22 M4
  adjudicated_by: grant-covered at i22 M4; the morning review confirms
---
## Rationale (not load-bearing)
A grant is an adjudication fact, so it lives where adjudication facts live: as
ledger events (grant-open with scope and expiry; grant-close with the collection).
The rejected alternative - a grant file in config - is editable state outside the
event chain; the no-bypass maxim falls. In-scope blesses stamp the grant id on
their existing event, so the collection is a query, not a second store.
model-grant-lifecycle carries the state contract. Shapes go-grant-store.
