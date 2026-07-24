---
id: se.req-apply-ergonomics
kind: requirement
statement: When se_set_apply receives execute with the hash of a prior dry_run, the engine shall apply those ops without their resend; when it receives ops without dry_run, it shall apply them directly; canvas edits shall offer surgical ops (add and remove of node and edge).
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Whole-canvas payloads ride twice per edit and the lane forces the pre-checking the fire-first philosophy forbids.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-3
---


