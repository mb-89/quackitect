---
id: req-results-exception
type: requirement
depends_on: []
statement: The book shall render failing checks and accepted deviations prominently from ledger state, and shall summarize passing checks as counts.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
By exception: ledger-state views are fig kinds, never base queries - state lives in the ledger, not frontmatter (template red-team finding 10).
