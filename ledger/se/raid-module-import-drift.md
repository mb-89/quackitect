---
id: se.raid-module-import-drift
kind: raid
statement: Imported modules can drift from their source or overwrite local vehicle work.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.5
v1_impact: 0.8
v1_mitigation: deterministic dry-run manifest with provenance
v1_owner: maintainer
v1_status: open
---

The update command must show create, write, delete, and provenance changes before it writes.
