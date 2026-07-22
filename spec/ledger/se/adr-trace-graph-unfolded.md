---
id: se.adr-trace-graph-unfolded
kind: decision
statement: "The trace graph carries the semantic design dimension only: no fold boxes and no iteration or age grouping. Age lives in the report's iteration sidebar. The fold machinery, age fold and fan fold, is removed. Render compaction for large tabs is an open design discussion deferred to a future iteration."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0021_field_ux
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v2_amendment: becomes the projection default (no fold boxes)
---

## Rationale (not load-bearing)
Owner ruling during the i21 fold bug hunt: the age fold's per-iteration boxes answered a
sidebar question (what belongs to which iteration) inside the design graph, hiding the needs
behind clicks and degenerating the default view whenever attribution misfired. The trace graph
answers ONE question - how the design hangs together - and the sidebar already owns the
iteration dimension. The fan fold went with it: one fold system, one removal, and the real
scaling need (large tabs) gets designed deliberately instead of inherited. The guard is
test-graph-suffix-rooted (no age box ever renders); the deferred discussion is seeded in the
notes backlog.

## v2 amendment (applied at mint)

becomes the projection default (no fold boxes)
