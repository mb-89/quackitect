---
id: test-filter-ux
type: test
verifies: [req-filter-clear, req-filter-descendants, req-filter-dblclick, req-filter-help]
statement: The rendered report contains the clear control wired to reset, the descendants predicate over refines/implements/verifies/addresses edges, the double-click handler applying it, and on-focus help naming all three; the descendants predicate computed for a sample node matches the engine-side cone.
class: executed
verify: selftest:report-filter-ux
killer: false
---
