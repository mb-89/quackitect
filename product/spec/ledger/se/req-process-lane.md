---
id: se.req-process-lane
kind: requirement
statement: When asked, the engine shall list, stop and cycle the processes it owns (board, engine child); foreign processes shall be refused.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: The netstat/taskkill side-channel returns for every board cycle - three occurrences on record.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-3
---


