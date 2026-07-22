---
id: se.adr-figures-derived-set
kind: decision
statement: "The engine derives a small fixed set of diagram kinds as inline SVG with real text: context model, building-block tree, timeline, stakeholder matrix. These are spike-gated at M5. Anything beyond the set is authored as inline SVG content by the drafting AI, provenance-marked like prose, with ASCII as the last fallback. View-time diagram rendering is rejected, since the visual would be script-created."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0012_spec_book
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
v2_amendment: folds into the projection catalog (design §20)
---

## Rationale (not load-bearing)
The cap is on automatic engine surface, not on figure count - deterministic layout of arbitrary graphs is the recorded infra grave (dagre exists for a reason). The AI-drawn inline SVG release valve keeps the diagrams-over-prose ruling generous at zero engine cost.

## v2 amendment (applied at mint)

folds into the projection catalog (design §20)
