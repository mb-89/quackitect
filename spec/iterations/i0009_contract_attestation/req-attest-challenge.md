---
id: req-attest-challenge
type: requirement
statement: When an attestation or renewal is requested, the engine shall verify a challenge answer against the current contract text before issuing a key.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [security]
---
## Rationale (not load-bearing)
The challenge is derived from and verified against the contract file itself (e.g. word N of rule K), so it deterministically proves the contract text entered the requesting context. Gameable by grep, but the target failure is drift, not adversarial agents.
