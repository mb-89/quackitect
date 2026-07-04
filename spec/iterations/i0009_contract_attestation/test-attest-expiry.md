---
id: test-attest-expiry
type: test
verifies: [req-attest-expiry]
statement: The command exceeding a key's configured budget is refused until a renewal issues a successor key.
class: executed
verify: selftest:attest-expiry
killer: false
---
