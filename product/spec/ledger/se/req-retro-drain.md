---
id: se.req-retro-drain
kind: requirement
statement: When a retro dispositions a note, the engine shall mark it drained with its disposition, and drained notes shall leave the inbox count.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: The inbox only ever grows (25 -> 30 during one retro); uc-7's pass line is unfulfillable.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-7
  - se.uc-1
---


