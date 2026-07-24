---
id: se.req-dotpath-field
kind: requirement
statement: When set_field receives a dot path, the write shall reach the nested frontmatter key; missing intermediate objects are created.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: Nested truth stays unreachable - the seven stale pending-owner stamps are the standing witness.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-6
---


