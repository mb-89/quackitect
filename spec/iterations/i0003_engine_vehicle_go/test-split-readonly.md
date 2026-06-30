---
id: test-split-readonly
type: test
statement: A vehicle run resolves engine and vehicle resources correctly and never writes under the engine directory.
verifies: [req-engine-vehicle-split, req-overlay-resolver]
class: executed
verify: selftest:split
killer: false
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the split lands and the resolver test writes SPLIT_OK. EXTEND during build to assert the overlay chain order and engine read-only.
