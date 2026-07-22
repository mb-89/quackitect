---
id: se.adr-module-import-manifest
kind: decision
statement: Module import and update use the deterministic manifest lane.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_decided_in: i0023_modules
v1_type: adr
v1_kind: architecture
---

The command computes file operations first. Dry run is the default review surface.
