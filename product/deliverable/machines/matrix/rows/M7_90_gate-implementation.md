---
kind: matrix-row
statement: "GATE implementation: built inside the baseline, verified green across all iterations."
state_kind: gate
filled_by: agent
depends_on: [verification]
---

## Guidance

Review per [[meth-gate-review]]. Models-adhered-to is a matrix check: the build filled the allocated elements and only those; a genuinely-needed new element goes back through the architecture gate.

## Evidence form

- build_planned | (killer) the seeded chunk machine exists and was walked | required
- models_adhered | the build fills the allocated elements - no unsanctioned element | required
- red_observed | every new check failed before the build | required
- designs_realized | every requirement has a realized design | required
- verification_green | the battery passes, all iterations | required
- quality_ok | internal quality reviewed | required
- risks_acceptable | implementation risks judged | required
