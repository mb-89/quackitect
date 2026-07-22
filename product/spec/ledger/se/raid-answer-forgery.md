---
id: se.raid-answer-forgery
kind: raid
statement: Anyone holding the topic or channel secret can forge an answer.
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
Risk (red-team round 2): accepted-risk BY RULING, must be written into the channel ADR at M4 - answer authenticity equals topic secrecy; high-entropy topics; industry baseline (HA context.id, LangGraph thread_id); self-host ACLs are the upgrade path.
