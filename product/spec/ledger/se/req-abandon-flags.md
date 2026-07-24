---
id: se.req-abandon-flags
kind: requirement
statement: When a worktree iteration is abandoned, the engine shall flag its worktree as abandoned and shall not delete it.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Delegated runs gain a destructive path - or dead trees pile up unmarked.
req_kind: functional
verify_method: test
source_refs:
  - se.decision-delegated-adjudication
---


