---
id: se.adr-ntfy-actions
kind: decision
statement: The ntfy ask renders X-Actions buttons publishing to the answer topic.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0016_structural_models
v1_type: adr
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: re-verified 2026-07-21
---

## Rationale (not load-bearing)
Pugh: actions dominates plain-reply on every criterion except a trivial effort delta; one tap answers (probed live 2026-07-09: PUT with X-Actions accepted, since-poll returns verbatim). Plain-reply remains the documented degraded path when a client lacks action support.
