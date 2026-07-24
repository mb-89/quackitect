---
id: se.req-phone-best-effort
kind: requirement
statement: If a publish fails, the engine shall record the failure and shall not block the offer; the 6h window and the board remain the fallback.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
breaks_if_removed: A flaky push could stall gate creation - notification must never gate adjudication.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-p1
---


