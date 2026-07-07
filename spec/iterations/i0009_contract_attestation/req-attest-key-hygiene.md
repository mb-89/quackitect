---
id: req-attest-key-hygiene
type: requirement
statement: The engine shall persist attestation keys only as hashes, printing each plaintext key exactly once in the issuing command's output.
depends_on: []
class: review
killer: false
phase: [maintenance]
discipline: [process]
quality: [maintainability, security]
---
## Rationale (not load-bearing)
The plaintext exists in exactly one place: the conversation. A new context cannot recover it from disk, so key possession is unforgeable proof of having lived through the attest ritual.
