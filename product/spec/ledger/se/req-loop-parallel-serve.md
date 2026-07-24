---
id: se.req-loop-parallel-serve
kind: requirement
statement: While an instance holds multiple active states, the loop shall serve every unclaimed active state to requesting sessions (claims recorded), never a single current only.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: Drawn parallel states keep skipping - fifteen inline walks across two iterations measured the gap the token engine alone cannot close.
req_kind: functional
verify_method: test
source_refs:
  - se.req-exec-parallel
  - se.uc-4
---


