---
id: engine-selftest
statement: The product package imports cleanly.
type: test
verifies: [state-model]
class: executed
verify: selftest:engine
killer: false
---

## Rationale (not load-bearing)

A minimal executed check: the machine adjudicates it by running `verify`. Demonstrates
the executed verifier class alongside the judgment decisions — result is cached in
.quack/evidence/ keyed by the input hash, re-run only when inputs change.
