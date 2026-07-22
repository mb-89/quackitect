---
id: se.adr-element-major-format
kind: decision
statement: A structural model declares its elements first, one per line with layer attribute and responsibility, then flows on declared names. This rides a lint-pinned Mermaid subset. Elements are allocated ahead of code and join realized design regions by marker id. Coordinates are refused, and layout derives.
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
---

## Rationale (not load-bearing)
The element-major DISCIPLINE is the owner's TikZ habit: declare every node first, then draw edges between names. The CARRIER is a pinned Mermaid subset, not an owned markdown grammar (owner round 2026-07-09): a self-made format - however small - violates the ownership law ("never be the language's owner"), while Mermaid-with-a-lint-pinned-subset is constrained mainstream, previews natively in Obsidian and GitHub, and keeps zero owned formats. The pinned subset per kind: flowchart TD with subgraph=layer (declaration order = rank, innermost first), node declarations before edges, node label = responsibility, edge labels mandatory (payloads); stateDiagram-v2 and sequenceDiagram subsets for the behavioral kinds. Beyond-subset syntax is a lint error, which fences Mermaid grammar drift. Plan-ahead holds: elements are allocated in the model BEFORE code; the design-marker id is the join; allocated-unrealized = honest hole, realized-unallocated = the sky-fall lint. Superseded option: element-owned code tags (killed by plan-ahead - nothing to review before code exists); layer-major long lines (owner: cumbersome); bespoke markdown lists (killed by the ownership law).
