---
id: test-vendor-layout
type: test
statement: Engine resources and source resolve vendor-first (.quack/vendor) with a dogfood fallback; a vendored vehicle resolves the engine without a hardcoded path.
verifies: [req-vendor-layout]
class: executed
verify: selftest:split
killer: false
---
## Rationale (not load-bearing)
Reuses the existing split self-test (overlay/read-only).
