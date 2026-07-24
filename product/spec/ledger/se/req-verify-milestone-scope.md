---
id: se.req-verify-milestone-scope
kind: requirement
statement: The engine shall run full-suite verification only inside a milestone verification state, and engine-filled commands shall execute as background runs.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Submits block for the suite duration and verification leaks between milestones - the measured 5s submits.
req_kind: constraint
verify_method: test
source_refs:
  - se.req-1s-interactive
---


