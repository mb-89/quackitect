---
id: fill-adjudicate
statement: Every check records filled_by and adjudicated_by separately. A gate is a check whose adjudicator must be human. Killer checks are always gates.
type: requirement
refines: [uc-engage-next]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Separating who does the work from who blesses it lets an agent take the boring checks later without a rewrite — the manual walker is just gate_frequency = all.
