---
id: se.raid-seeding-drift
kind: raid
statement: The engine-seeded checklist drifts from the rigor template. A template change stops reaching new iterations, or the seeder bakes its own divergent copy of the milestones.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.4
v1_impact: 0.6
v1_mitigation: the seeder reads the rigor checklist SOURCE at seed time (single source of truth, no baked copy); test-seed-skeleton asserts the emitted set lints clean; the composer tailors ABOVE the floor, never edits the emitted wiring by hand
v1_owner: driving agent
v1_status: open
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
The i20-m4-seed defer reason warned a rushed generator risks the working-tomorrow goal.
Template-book drift is the analogous solved problem (owner render law: template layer first);
the seeder gets the same discipline.
