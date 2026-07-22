---
id: se.raid-guard-timing-flakes
kind: raid
statement: The progress and concurrency tests measure timing. Heavy load can flake them in the battery.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.3
v1_impact: 0.3
v1_mitigation: Tests assert order and overlap, never durations. Fixture windows stay wide. A flake re-records through quack verify. The precedent is raid-timing-tests (i21).
v1_owner: the driving agent
v1_status: open
v1_class: review
v1_killer: "false"
v1_provenance_class: schema-default (review)
v1_provenance_impact: schema-default (0.5)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: schema-default (risk)
v1_provenance_mitigation: agent-proposed at i22 M1
v1_provenance_owner: agent-proposed at i22 M1
v1_provenance_probability: agent-proposed at i22 M1
v1_provenance_status: schema-default (open)
---

## Rationale (not load-bearing)
i21's hand-off lifecycle tests already flaked under load once. The concurrency
test (req-battery-parallel) is the same class. Design the assertions load-proof.
