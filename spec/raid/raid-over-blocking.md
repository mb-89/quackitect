---
id: raid-over-blocking
type: raid
kind: risk
probability: 0.4
impact: 0.5
mitigation: Every refusal names the lawful lane in its message. The console channel never gets a new refusal. The verify lane stays open for one check at any time.
owner: the driving agent
status: open
statement: A new refusal can hit a lawful move. The walk stalls at the refused command.
class: review
killer: false
provenance:
  class: schema-default (review)
  impact: schema-default (0.5)
  killer: schema-default (false)
  kind: schema-default (risk)
  mitigation: agent-proposed at i22 M1
  owner: agent-proposed at i22 M1
  probability: agent-proposed at i22 M1
  status: schema-default (open)
---
## Rationale (not load-bearing)
The refusals are new engine behavior on the busiest channel. A wrong predicate
(review-in-hand detection, channel detection) blocks lawful work. The mitigation
keeps an always-open lane per command class.
