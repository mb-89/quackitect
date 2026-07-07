---
id: test-launcher-single-dispatch
type: test
statement: With the global binary present, one launcher invocation produces exactly one engine dispatch in the call log.
class: executed
verify: selftest:launcher-single-dispatch
killer: false
tests_red: exempt - the launcher already dispatches once per call (quack.cmd is probe-free); the i12 argless root calls stem from elsewhere - bs03 diagnoses the real source; the case guards the observable
---
## Rationale (not load-bearing)
TODO
