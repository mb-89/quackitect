---
id: se.raid-module-id-collisions
kind: raid
statement: Module-local content can collide in the current global id namespace.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.4
v1_impact: 0.6
v1_mitigation: module-prefix lint before true composite ids
v1_owner: maintainer
v1_status: open
---

The first implementation should keep globally unique ids and lint module prefixes before any later composite identity change.
