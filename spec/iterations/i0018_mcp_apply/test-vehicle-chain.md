---
id: test-vehicle-chain
type: test
statement: End to end in a hermetic home - a vehicle with a committed method override creates a stub; the stub resolves the vehicle's override; the machine-global engine home survives untouched.
class: executed
verify: selftest:vehicle-chain
killer: false
tests_red: exempt - the birth red stands in the ledger (red-observed @62ba0ae371c6, 2026-07-12T10:01:55); post-green trace wiring (the uc retarget req-traced demanded, the realized design markers) moved the input hash, and the built behavior leaves no red observable at the current one (adr-red-unobservable)
---
## Rationale (not load-bearing)
Verifies req-vehicle-drives-stub as one chain, the way the owner will drive it: create a vehicle,
commit an override into its product overlay, let the vehicle create a stub, drive the stub, and
assert the stub sees the vehicle's method while the global pointer still names the engine repo.
The chain is the test - the layers were unit-tested before (split, engine-root) and the gap
between them is exactly what those tests missed.
