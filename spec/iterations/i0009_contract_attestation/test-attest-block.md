---
id: test-attest-block
type: test
verifies: [req-attest-block]
statement: An agent-channel ledger-advancing command without a valid key exits nonzero naming contract.md; with a valid key it proceeds; read-only commands run keyless.
class: executed
verify: selftest:attest-block
killer: false
---
