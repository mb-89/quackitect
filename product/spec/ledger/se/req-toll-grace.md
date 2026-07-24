---
id: se.req-toll-grace
kind: requirement
statement: When the update window lapses, the next call shall pass carrying a warning in its result; only a subsequent call still without an update shall be refused; any update clears the warning state.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: Every cold toll costs a full resend round-trip (~30s measured) for zero information gained.
req_kind: constraint
verify_method: test
source_refs:
  - se.req-toll-submit
---


