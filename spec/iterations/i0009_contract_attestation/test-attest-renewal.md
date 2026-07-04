---
id: test-attest-renewal
type: test
verifies: [req-attest-renewal]
statement: Presenting the most recent key plus a correct challenge answer yields a successor key with no grant involved; a stale (superseded) key is refused.
class: executed
verify: selftest:attest-renewal
killer: false
---
