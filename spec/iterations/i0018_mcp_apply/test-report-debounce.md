---
id: test-report-debounce
type: test
statement: A bless-triggered report refresh inside the debounce interval of the last render is skipped; one outside the interval renders.
class: executed
verify: selftest:report-debounce
killer: false
---
## Rationale (not load-bearing)
Arrives RED at M6; the selftest does not exist at compose time.
