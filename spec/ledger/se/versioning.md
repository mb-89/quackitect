---
id: se.versioning
kind: decision
statement: Each version is an iteration. An iteration is a git branch or worktree. notes/backlog is trunk-owned, and quack note commits there. Parallel iterations run as worktrees.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: requirement
v1_adjudicated_by: human
v1_killer: "true"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
p3_note: iteration = branch/worktree
---

## Rationale (not load-bearing)

Worktrees give true parallel iterations; the backlog lives above iterations on trunk so notes survive a discarded experiment.
