---
id: se.raid-over-blocking
kind: raid
statement: A new refusal can hit a lawful move. The walk stalls at the refused command.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.4
v1_impact: 0.5
v1_mitigation: Every refusal names the lawful lane in its message. The console channel never gets a new refusal. The verify lane stays open for one check at any time.
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
The refusals are new engine behavior on the busiest channel. A wrong predicate
(review-in-hand detection, channel detection) blocks lawful work. The mitigation
keeps an always-open lane per command class.
