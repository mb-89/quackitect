---
id: verify-green
type: test
verifies: [req-split, req-coverage, req-metrics, req-version-mgmt, req-tooling, req-review]
statement: The i0002 integration suite is green. Report determinism holds. The three metrics compute, with no deferred placeholders. Version selection picks correctly. The trace/task split holds (trace is content, gates carry state). Coverage rules evaluate. The milestone-review guide exists. Suspect/bless is unchanged.
depends_on: []
class: executed
verify: selftest:parity
killer: true
---

## Rationale (not load-bearing)
M6 killer (executed). Asserts determinism AND that the metrics were built (the deferred
placeholder is gone). Stays OPEN until build-metrics lands. EXTEND during build to also
assert version-selection.
