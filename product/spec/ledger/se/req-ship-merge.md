---
id: se.req-ship-merge
kind: requirement
statement: When the release gate blesses a worktree iteration, the ship path shall merge its branch into the trunk, remove the worktree, and keep the branch for history.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Shipped work strands on branches and worktree debris accumulates.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


