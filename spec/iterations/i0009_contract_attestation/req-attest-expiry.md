---
id: req-attest-expiry
type: requirement
refines: [uc-attested-session]
statement: When an attestation key has authorized its configured budget of ledger-advancing commands, the engine shall expire it.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Command-bounded, not time-bounded (default budget ~20, configurable). Expiry forces a renewal, whose challenge forces a contract re-read — the anti-drift cadence, priced in agent-seconds.
