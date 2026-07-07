---
id: test-vehicle-scaffold
type: test
statement: start init produces a runnable vehicle whose gather resolves the engine's rigor/type resources through the vendored overlay chain.
class: executed
verify: selftest:integrate
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
Reuses the integrate self-test; the scaffold is demonstrated end-to-end by test-machinery-e2e.
