---
id: req-field-tier
type: requirement
statement: The field schema shall declare each field's tier - core or deferrable - and every schema consumer shall honor the tier - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The field schema shall declare each field's tier as core or deferrable.
2. While a core field holds an unadjudicated value, the owning node shall count as undecided.
3. While only deferrable fields hold defaults, the owning node shall count as complete-with-deferrals.

## Rationale (not load-bearing)
Field tiering (seed NOTE-20260711-141259-seed-onboarding-experience, fix 2): extend the TBD
mechanism from values to whole fields. Core blocks; deferrable defaults-and-counts. The i18
schemas (req-field-schemas) carry the machine-readable home; this requirement adds the tier
dimension and its semantics.
