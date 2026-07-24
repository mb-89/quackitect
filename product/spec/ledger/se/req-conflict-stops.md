---
id: se.req-conflict-stops
kind: requirement
statement: If a ship merge hits a textual conflict, the engine shall stop, record the conflict, and leave resolution to a human - never auto-resolve.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Unattended merges guess at conflicting truth exactly when nobody is watching.
req_kind: functional
verify_method: test
source_refs:
  - se.stakeholders
---


