---
id: se.req-log-hygiene
kind: requirement
statement: When a call fails, its log line shall carry the clause and a short reason; every dispatch shall produce exactly one log line.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: "Retros cannot rank clauses and demand counts double - measured: 74 failures with zero recoverable clauses, 28 lines for 14 se_help calls."
req_kind: quality
verify_method: test
source_refs:
  - se.uc-7
---


