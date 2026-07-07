---
id: engine-selftest
statement: The product package imports cleanly.
type: test
class: executed
verify: selftest:engine
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)

A minimal executed check: the machine adjudicates it by running `verify`. Demonstrates
the executed verifier class alongside the judgment decisions — result is cached in
.quack/evidence/ keyed by the input hash, re-run only when inputs change.
