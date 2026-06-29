---
id: spike-risk
type: adr
addresses: [req-metrics]
statement: The riskiest unknown is validated by a spike. Move attest to append-only. Move next to version-aware. The existing suspect/bless killers still behave unchanged on the current ledger. Evidence is recorded. The design is updated if the spike demands it.
depends_on: [arch-adr]
class: review
killer: true
---

## Rationale (not load-bearing)
M5 killer. The one thing that, if wrong, breaks v0: do not regress suspect/bless.
