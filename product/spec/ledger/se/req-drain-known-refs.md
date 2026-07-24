---
id: se.req-drain-known-refs
kind: requirement
statement: When se_note_drain names a ref no live note carries, the lane shall refuse with the unknown ref named instead of appending a dead drain line.
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: Silent dead drains fake dispositions - today's truncated-ref incident repeats.
req_kind: functional
verify_method: test
source_refs:
  - se.stakeholders
---


