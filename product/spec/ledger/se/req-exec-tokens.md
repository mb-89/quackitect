---
id: se.req-exec-tokens
kind: requirement
statement: While an iteration is open, the engine shall track its active states as a token set on the instance, and every activation and completion shall land in the history with its evidence.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Skipped or concurrent states leave no trustworthy record; hand-editing the instance becomes the lane.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-4
  - se.uc-9
---


