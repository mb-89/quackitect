---
id: se.adr-veto-key-file
kind: decision
statement: Session keys persisted to disk are scrapped. Plaintext at rest breaks req-attest-key-hygiene. Key possession must prove the ritual, and disk outlives the session (i9 M3 axis A3c).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
A session key could be cached to disk for convenience.
Key hygiene requires that holding the key proves the ritual was done.
A file on disk outlives the session that earned it.
Anyone who reads the file could then act without the ritual.
So only sha256 hashes are stored, and the plaintext key lives in exactly one place: the conversation that received it.
