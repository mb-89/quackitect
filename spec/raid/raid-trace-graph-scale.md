---
id: raid-trace-graph-scale
type: raid
kind: risk
probability: 0.4
impact: 0.6
mitigation: the collapsible cluster bundling (req-trace-collapsible) shrinks the rendered graph an order of magnitude; the M5 spike proves the render or reopens the design
owner: the project owner
status: open
statement: The item-level node-link trace graph has no RM-tool precedent proving it scales for trace browsing; mainstream tools render tables.
class: review
killer: false
provenance:
  class: schema-default (review)
  impact: agent-proposal from the i0027 M2 research
  killer: schema-default (false)
  kind: schema-default (risk)
  mitigation: agent-proposal from the i0027 M2 research (Jama/DOORS render trace as tables)
  owner: agent-proposal
  probability: agent-proposal
  status: schema-default (open)
---
## Rationale (not load-bearing)
From the i0027 M2 prior-art research (ref-jama-traceability): Jama's item-level trace views are tabular; its diagram view is type-level only. Our node-link graph is a differentiator without tool precedent at scale.
