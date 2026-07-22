---
id: se.raid-module-scope-confusion
kind: raid
statement: Nested module names can be mistaken for nested projects.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.4
v1_impact: 0.7
v1_mitigation: one ledger and filter-only parent rollups
v1_owner: maintainer
v1_status: open
---

The first implementation keeps one iteration and one ledger. Parent modules are view rollups only.
