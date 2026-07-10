---
id: test-ask-hardening
type: test
statement: Concurrent ask saves merge instead of clobbering, await reloads its store each loop, and an answer stamped older than its ask is refused.
class: executed
verify: selftest:ask-hardening
killer: false
---
## Rationale (not load-bearing)
TODO
