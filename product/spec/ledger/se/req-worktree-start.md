---
id: se.req-worktree-start
kind: requirement
statement: When se_loop_start opens a planned iteration, the engine shall create a dedicated git worktree and branch for it and open the instance inside that worktree.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Iterations keep sharing one working directory - isolation never exists and parallel streams stay impossible.
req_kind: functional
verify_method: test
source_refs:
  - se.context
  - se.stakeholders
---


