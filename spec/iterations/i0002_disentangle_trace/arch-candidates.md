---
id: arch-candidates
type: adr
addresses: [req-split]
statement: At least two viable trace models were weighed. Option A is a FIXED 5-layer V-model: need -> uc -> requirement -> design -> test, a single refines edge, tasks prefixed and separate. Option B is a flexible refines-DAG with variable depth and same-type refinement. The criteria came from the requirements. Feasibility was rough-checked.
depends_on: [req-split, req-coverage, req-version-mgmt, req-metrics, req-tooling, req-review]
class: review
killer: true
---

## Rationale (not load-bearing)
M3 killer. A (fixed, a discipline) vs B (flexible). Decided at M4.
