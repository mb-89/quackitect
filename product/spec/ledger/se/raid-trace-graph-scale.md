---
id: se.raid-trace-graph-scale
kind: raid
statement: The item-level node-link trace graph has no RM-tool precedent proving it scales for trace browsing; mainstream tools render tables.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  p3_status: post-p3-addition
v1_type: raid
v1_kind: risk
v1_probability: 0.4
v1_impact: 0.6
v1_mitigation: the collapsible cluster bundling (req-trace-collapsible) shrinks the rendered graph an order of magnitude; the M5 spike proves the render or reopens the design
v1_owner: the project owner
v1_status: open
v1_class: review
v1_killer: "false"
v1_provenance_class: schema-default (review)
v1_provenance_impact: agent-proposal from the i0027 M2 research
v1_provenance_killer: schema-default (false)
v1_provenance_kind: schema-default (risk)
v1_provenance_mitigation: agent-proposal from the i0027 M2 research (Jama/DOORS render trace as tables)
v1_provenance_owner: agent-proposal
v1_provenance_probability: agent-proposal
v1_provenance_status: schema-default (open)
---

## Rationale (not load-bearing)
From the i0027 M2 prior-art research (ref-jama-traceability): Jama's item-level trace views are tabular; its diagram view is type-level only. Our node-link graph is a differentiator without tool precedent at scale.
