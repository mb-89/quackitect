---
id: test-attest-key-hygiene
type: test
verifies: [req-attest-key-hygiene]
statement: Attestation state on disk contains no plaintext key; the plaintext appears exactly once, in the issuing command's stdout.
class: executed
verify: selftest:attest-keys
killer: false
---
