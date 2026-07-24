---
id: se.req-exec-parallel
kind: requirement
statement: When a state completes, the executor shall activate every successor state whose inbound edges have all fired; a state with unfired inbound edges shall remain inactive until all of them fire.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: "The drawn machine stays decoration: parallel branches skip silently - six hand side-channels in i3's M1/M2 measured exactly this."
req_kind: functional
verify_method: test
source_refs:
  - se.uc-4
  - se.machine-systematic
---


