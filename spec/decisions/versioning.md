---
id: versioning
statement: Each version is an iteration. An iteration is a git branch or worktree. notes/backlog is trunk-owned, and quack note commits there. Parallel iterations run as worktrees.
type: requirement
adjudicated_by: human
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
---

## Rationale (not load-bearing)

Worktrees give true parallel iterations; the backlog lives above iterations on trunk so notes survive a discarded experiment.
