---
id: se.adr-one-ledger-modules
kind: decision
statement: Modules share one workspace iteration and one ledger.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_decided_in: i0023_modules
v1_type: adr
v1_kind: architecture
---

Modules scope ownership and views. They do not create independent timelines.
