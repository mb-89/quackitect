---
id: se.req-log-aggregate
kind: requirement
statement: When a session requests a log aggregation (filter, group, count over declared log fields), the engine shall serve it; the retro's counts, clauses and misses shall be expressible as such queries.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
breaks_if_removed: Every retro hand-writes throwaway scripts over the logs - witnessed twice in one session, owner-ruled generic.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-7
---


