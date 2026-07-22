---
id: se.raid-dangling-notifications
kind: raid
statement: A timed-out or superseded ask leaves a stale actionable notification on the phone.
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
Risk (Home Assistant prior art): every pending ask carries a timeout, answers are idempotent and correlation-bound (late or duplicate answers safely ignored), expiry clears or supersedes the notification.
