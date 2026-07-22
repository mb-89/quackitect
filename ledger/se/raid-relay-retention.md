---
id: se.raid-relay-retention
kind: raid
statement: Third-party relays retain ask content (ntfy.sh caches about 12 hours; Slack stores messages indefinitely).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.5
v1_impact: 0.5
v1_mitigation: TODO
v1_owner: TODO
v1_status: open
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Risk (owner-ruled acceptable): the pairing flow prints a transit disclaimer; self-hosting removes retention; asks carry check ids and statements, never secrets.
