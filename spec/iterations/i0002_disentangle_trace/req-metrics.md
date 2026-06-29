---
id: req-metrics
type: requirement
refines: [uc-review-report]
statement: Attest becomes an append-only event log of bless, reopen, and reverse events. Each event has an actor and a timestamp. Current state is still the latest event per check. The existing attest migrates into the log. Each check's current attestation becomes its first event. No check's DONE/SUSPECT/OPEN state changes. Reversal rate, rework rate, and self-cert ratio are derived from the log. The report shows them with their formulas.
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2. Append-only unlocks reversal/rework; the actor field unlocks self-cert.
