---
id: se.req-commit-window
kind: requirement
statement: When se_git commit is called outside the window from a gate bless to the next loop submit, the engine shall refuse; an explicit owner grant shall override for emergencies.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Arbitrary-state commits return; the verify -> gate -> bless -> commit rhythm decays to habit.
req_kind: constraint
verify_method: test
source_refs:
  - se.uc-3
---


