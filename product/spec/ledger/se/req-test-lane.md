---
id: se.req-test-lane
kind: requirement
statement: When a session requests a test run outside a milestone verification state, the engine shall refuse with a remedy; inside one, a single call shall run the declared suite as a background run.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Over-checking returns between milestones; the trust-the-process law decays back into prose.
req_kind: constraint
verify_method: test
source_refs:
  - se.req-verify-milestone-scope
---


