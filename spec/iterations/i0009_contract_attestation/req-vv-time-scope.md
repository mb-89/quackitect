---
id: req-vv-time-scope
type: requirement
statement: When a derived coverage check is computed, the engine shall include only trace nodes from the check's own iteration and earlier.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Cheap by construction: nodes already carry their iteration; iteration ids are ordered; a check's home directory names its iteration. Applies uniformly to tests-pass, meets-need cones, req-traced, and friends — for the latest iteration the result is identical to today's all-iterations rule, so the regression net is unchanged. The method text (engage.md "V&V is global") gets the matching refinement in the build.
