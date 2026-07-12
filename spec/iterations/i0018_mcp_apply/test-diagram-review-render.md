---
id: test-diagram-review-render
type: test
statement: The standalone model render marks a changed element and carries the mark up to its cluster and its ring; the output is one self-contained HTML file with no external request.
class: executed
verify: selftest:diagram-review-render
killer: false
tests_red: exempt - the standalone render and its change-mark propagation landed as they were built in this iteration; no separable red state was ever observable (adr-red-unobservable)
---
## Rationale (not load-bearing)
Verifies req-diagram-review-render.
It asserts the propagation up the drill-down and the self-contained property.
