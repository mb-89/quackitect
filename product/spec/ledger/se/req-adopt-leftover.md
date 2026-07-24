---
id: se.req-adopt-leftover
kind: requirement
statement: When start finds the iteration's worktree or branch already existing, the engine shall adopt the leftover, never create a duplicate.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: A crashed session leaves debris that blocks or forks the iteration's identity.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


