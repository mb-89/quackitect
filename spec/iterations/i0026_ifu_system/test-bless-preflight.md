---
id: test-bless-preflight
type: test
statement: A direct bless refuses unfinished prerequisites and missing first-time review evidence.
class: executed
verify: selftest:bless-preflight
tests_red: exempt - the test was authored after the already-green bless-preflight implementation (adr-red-unobservable)
---