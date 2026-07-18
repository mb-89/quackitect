---
id: req-pugh-render
type: requirement
depends_on: []
statement: The book and the hand-off shall render an M4 decision's Pugh matrix derived from criterion weights, candidate ratings, and the chosen edge, never from prose.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The derived matrix (owner ruling, 2026-07-18)

- One table per M4 decision: criteria as rows with their weight, candidates as columns, the datum column marked.
- Cells derive as the sign of each rating's delta against the datum (better, same, worse). The raw 0..1 rating stays reachable on expand.
- A weighted-totals row closes the table. The winner mark derives from the decision's chosen edge.
- Controlled convergence renders as one matrix per recorded run.
- The render uses our palette, not the template world's traffic-light cells. The concrete look is an M4/M6 design decision.
- Data gaps the build closes: criterion weight becomes a frontmatter field (migrating the prose weights of the existing criteria), and the decision declares its datum candidate.
- The Pugh prose in past M4 evidence docs stays as history; new decisions carry the data and get the render.

## Rationale (not load-bearing)
The Pugh content today is prose in M4 evidence docs, hard to read in hand-offs and the book. Everything the matrix needs already lives in nodes except the weight field and the datum declaration, so the matrix is a view, not new data. External guidance (5-7 weighted criteria, an incumbent or neutral datum) matches the M4 method as written.
