---
id: adr-veto-key-file
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: Session keys persisted to disk are scrapped: plaintext at rest breaks req-attest-key-hygiene — key possession must prove the ritual, and disk outlives the session (i9 M3 axis A3c).
class: review
killer: false
---
## Rationale (not load-bearing)
A session key could be cached to disk for convenience.
Key hygiene requires that holding the key proves the ritual was done.
A file on disk outlives the session that earned it.
Anyone who reads the file could then act without the ritual.
So only sha256 hashes are stored, and the plaintext key lives in exactly one place: the conversation that received it.
