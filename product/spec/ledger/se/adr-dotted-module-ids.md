---
id: se.adr-dotted-module-ids
kind: decision
statement: Nested modules are dotted ids with view rollups, not recursive project containers.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_decided_in: i0023_modules
v1_type: adr
v1_kind: architecture
---

This gives `doc.review` without introducing nested gates, nested ledgers, or nested iteration state.
