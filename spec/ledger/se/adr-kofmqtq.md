---
id: se.adr-kofmqtq
kind: anti_decision
statement: "Retired by the owner's ruling 2026-07-16: ntfy suffices as the phone lane. The Slack text-poll lane is not built and will not be. The paired ntfy channel carries asks, answers, and blesses end-to-end."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0025_clean_state
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: "agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm"
graveyard: "true"
p3_note: Slack never
---

## Rationale (not load-bearing)
The Slack text-poll lane was adopted in i15 as a fallback channel but never built. The ntfy lane shipped instead and proved itself end-to-end: pairing, asks, one-tap answers, and blesses. A second adapter would duplicate a working lane for no recorded need. The owner ruled it retired on 2026-07-16.

## Graveyard note (why-not, queryable)

Slack never
