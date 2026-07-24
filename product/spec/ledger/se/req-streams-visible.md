---
id: se.req-streams-visible
kind: requirement
statement: The projection shall list every open worktree iteration with its root and iteration id in the agents/tab data.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Concurrent streams run invisibly - the board shows one root while N are live.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


