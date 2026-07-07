---
id: verify-green
type: test
statement: The i0002 integration suite is green. Report determinism holds. The three metrics compute, with no deferred placeholders. Version selection picks correctly. The trace/task split holds (trace is content, gates carry state). Coverage rules evaluate. The milestone-review guide exists. Suspect/bless is unchanged.
depends_on: []
class: executed
verify: selftest:determinism
killer: true
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 killer (executed). Asserts determinism AND that the metrics were built (the deferred
placeholder is gone). Stays OPEN until build-metrics lands. EXTEND during build to also
assert version-selection.
