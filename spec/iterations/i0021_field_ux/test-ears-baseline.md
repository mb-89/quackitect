---
id: test-ears-baseline
type: test
statement: On the shipped tree quack lint reports zero non-exempt EARS findings and a clean tree exits 0; every historical exemption cites adr-grandfathers-historical.
class: executed
verify: selftest:ears-baseline
killer: false
---
## Rationale (not load-bearing)
The class guard for the grandfather sweep (NOTE-20260712-113752): after the ~18 historical
statements carry their exempt markers, a NEW finding stands out and lint's exit code regains
meaning. Verifies the existing req-ears-authoring - the sweep is data, not a new requirement.
