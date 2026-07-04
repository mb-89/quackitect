---
id: req-render-drift
type: requirement
refines: [uc-contract-delivery]
statement: If the entry chain breaks — a pointer file stops naming its next link, AGENTS.md loses the contract ritual or path, or a contract copy is embedded outside contract.md — then quack selftest shall go red.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
The drift guard survives the render's removal in pointer form: with no generator, the risk is
no longer a stale render but a silently broken link or a re-forked contract body. The selftest
byte-checks the chain deterministically, so a hand-edit that severs it is a loud finding.
