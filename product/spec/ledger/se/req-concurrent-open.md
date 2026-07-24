---
id: se.req-concurrent-open
kind: requirement
statement: When two planned iterations have no unmet dependencies, the engine shall allow both to be open at the same time, each in its own worktree.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: SE-C-031 stays repo-global and parallelism is refused by construction.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


