---
id: adr-trace-graph-unfolded
type: adr
decided_in: i0021_field_ux
adjudicated_by: user
statement: The trace graph carries the semantic design dimension only: no fold boxes and no iteration or age grouping - age lives in the report's iteration sidebar. The fold machinery (age fold and fan fold) is removed; render compaction for large tabs is an open design discussion deferred to a future iteration.
class: review
killer: false
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
