---
id: se.req-link-rename
kind: requirement
statement: When a note or a section is renamed through the refactor lane, every inbound markdown link including section targets shall be updated in the same apply.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Renames silently orphan links across the ledger; the book's references rot.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-6
---


