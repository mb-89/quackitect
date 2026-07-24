---
id: se.req-boot-project
kind: requirement
statement: When se_boot is called without a named project, the engine shall refuse and instruct the session to ask the owner which project to lock onto.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Sessions assume the project from context; the one-question boot ritual stays prose and gets skipped.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-3
---


