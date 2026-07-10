---
id: raid-answer-forgery
type: raid
kind: risk
probability: 0.5
impact: 0.5
mitigation: TODO
owner: TODO
status: open
statement: Anyone holding the topic or channel secret can forge an answer.
class: review
killer: false
---
## Rationale (not load-bearing)
Risk (red-team round 2): accepted-risk BY RULING, must be written into the channel ADR at M4 - answer authenticity equals topic secrecy; high-entropy topics; industry baseline (HA context.id, LangGraph thread_id); self-host ACLs are the upgrade path.
