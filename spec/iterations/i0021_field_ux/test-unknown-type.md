---
id: test-unknown-type
type: test
statement: A node whose type is outside the known set (a stray type:note, a typo) is refused by the strict referee naming the type. It never silently becomes a blessable gate. Every known type still loads clean.
class: executed
verify: selftest:unknown-type-refused
killer: false
---
## Rationale (not load-bearing)
The i19 M5 spike's finding 6 (the engine-hygiene priority): a stray type:note in an iteration
dir loaded as an OPEN gate because isGate defaults unknown types to true. The class guard makes
the referee fail loud at the door instead - pulled into i0021 by the owner while the M6 gate
waited. Verifies the existing req-structural-strictness.
