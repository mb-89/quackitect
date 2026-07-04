---
id: test-attest-grant
type: test
verifies: [req-attest-grant]
statement: A first attestation (no prior key) is refused without a console-minted grant and succeeds with one; a grant is single-use.
class: executed
verify: selftest:attest-grant
killer: false
---
