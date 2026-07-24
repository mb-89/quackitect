---
id: se.req-phone-idempotent
kind: requirement
statement: When a tap names no live offer, a mismatched hash, or an already-honored answer, the engine shall ignore it and leave the grant chain unchanged.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: A stale or duplicate tap could bind the wrong gate or double-bless.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p2
---


