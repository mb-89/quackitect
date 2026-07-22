---
id: se.fill-adjudicate
kind: decision
statement: Every check records filled_by and adjudicated_by separately. A gate is a check whose adjudicator must be human. Killer checks are always gates.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: requirement
v1_adjudicated_by: human
v1_killer: "true"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
p3_note: "amended: adjudicator is a named role, human by default, agent-delegable"
---

## Rationale (not load-bearing)

Separating who does the work from who blesses it lets an agent take the boring checks later without a rewrite — the manual walker is just gate_frequency = all.
