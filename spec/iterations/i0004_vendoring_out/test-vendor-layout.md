---
id: test-vendor-layout
type: test
statement: Engine resources and source resolve vendor-first (.quack/vendor) with a dogfood fallback; a vendored vehicle resolves the engine without a hardcoded path.
class: executed
verify: selftest:split
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
Reuses the existing split self-test (overlay/read-only).
