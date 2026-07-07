---
id: uc-attested-session
type: usecase
statement: A fresh agent context cannot advance the ledger until the contract has entered its context and the adjudicator has granted once; within the session, key renewals are autonomous so unattended runs never stall on a person.
class: review
killer: false
---
## Rationale (not load-bearing)
The advisory floor failed in the field twice (Copilot i6; Claude Code 2026-07-04, the contract re-read skipped mid-engage). The session boundary is defined by possession of the key — the only storage born and dying with the context window — not by TTLs or PIDs.
