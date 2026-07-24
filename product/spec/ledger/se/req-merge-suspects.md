---
id: se.req-merge-suspects
kind: requirement
statement: When a ship merge lands, every ledger node changed by both the iteration branch and the trunk since their fork point shall gain the suspect mark.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Parallel design edits reunify silently - uc-4's across-iterations pass line stays forever unpaid.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-4
---


