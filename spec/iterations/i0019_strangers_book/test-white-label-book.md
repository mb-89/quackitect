---
id: test-white-label-book
type: test
statement: A book rendered from a fixture vehicle carries the vehicle's title, wordmark, and self-referential voice with the engine credited in the colophon; a planted engine-name-as-identity leak fails the check naming the leak.
class: executed
verify: selftest:white-label-book
killer: false
---
## Rationale (not load-bearing)
The book lane on top of the proven brand-asset lane: render FROM a vehicle (hermetic fixture,
the vehicle-chain pattern), assert identity and credit, and prove the check can fail by
planting a leak. Mentions of the engine stay legal - only identity is flagged
(owner bar, NOTE-20260712-113841).
