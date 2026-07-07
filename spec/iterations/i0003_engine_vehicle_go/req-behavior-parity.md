---
id: req-behavior-parity
type: requirement
statement: The Go engine preserves the exact observable behavior of the Python engine. Same commands status next start why bless note gather report ship lint verify. Same node model and suspect-bless semantics. Same coverage rules. The report determinism root is byte-identical to the Python output for the same spec.
depends_on: [req-go-engine]
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [reliability]
---

## Rationale (not load-bearing)
M2 killer. The port must not change the method. Parity is proven by a golden-output suite (test-parity-golden).
