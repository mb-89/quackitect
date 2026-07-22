---
id: se.raid-vale-dependency
kind: raid
statement: Vale is the first soft runtime dependency.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: dependency
v1_probability: 0.3
v1_impact: 0.4
v1_mitigation: never linked; pulled once; loud graceful absence
v1_owner: project-owner
v1_status: accepted
v1_class: review
v1_killer: "false"
---

Vale is the first soft runtime dependency. Accepted trade, recorded in its decision: absence yields one loud warning and an empty advisory lane, never a broken build.
(Backfilled at the i12 pilot migration from M1-frame.md and M6-evidence.md.)
