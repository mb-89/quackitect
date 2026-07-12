---
id: test-lint-exit-honest
type: test
statement: quack lint exits zero when the output carries only advisories, and exits nonzero when a finding is present.
class: executed
verify: selftest:lint-exit-honest
killer: false
---
## Rationale (not load-bearing)
Arrives RED at M6; the selftest does not exist at compose time.
