---
id: se.req-toll-submit
kind: requirement
statement: When se_loop_submit arrives without an update, the engine shall refuse; when any call arrives more than five minutes after the last update, the toll shall demand one; the toll text shall state that volunteered updates are never stopped.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: The board goes dark between milestones; the owner reads silence as stuck.
req_kind: constraint
verify_method: test
source_refs:
  - se.uc-8
---


