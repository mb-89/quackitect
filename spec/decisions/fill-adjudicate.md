---
id: fill-adjudicate
statement: Every check records filled_by and adjudicated_by separately; a gate is a check whose adjudicator must be human; killer checks are always gates.
depends_on: [pivot]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Separating who does the work from who blesses it lets an agent take the boring checks later without a rewrite — the manual walker is just gate_frequency = all.
