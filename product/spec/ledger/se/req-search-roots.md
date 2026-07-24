---
id: se.req-search-roots
kind: requirement
statement: When a file-lane call names a declared root (imports, v1, the owner's working folder), the engine shall serve it; undeclared roots shall be refused.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Cross-repo research (v1 precedent, owner design docs) keeps needing logged-miss direct reads outside the machinery.
req_kind: functional
verify_method: test
source_refs:
  - se.context
---


