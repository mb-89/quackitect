---
id: se.raid-metadata-sprawl
kind: raid
statement: DITA-style metadata sprawl was the recorded M1 risk.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: assumption
v1_probability: 0.4
v1_impact: 0.6
v1_mitigation: derive over store - no per-node audience tags
v1_owner: project-owner
v1_status: closed
v1_class: review
v1_killer: "false"
---

DITA-style metadata sprawl was the recorded M1 risk. The mitigation held: audience and status stay DERIVED; only judgment classifications (facets) are stored, vocabularies type-gated.
(Backfilled at the i12 pilot migration from M1-frame.md and M6-evidence.md.)
