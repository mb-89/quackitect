---
id: req-candidates
type: requirement
depends_on: []
statement: The engine shall carry candidate nodes - an axis, ratings from zero to one per criterion - that decisions choose or reject through links, and the book shall render the candidates against the criteria as a derived matrix.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Candidates are born at M3; ADRs decide over them (chosen/rejected links own the verdicts); status derives from the links, never stored; rejected candidates stay referenced so history survives the orphan lint. The derived candidates-x-criteria matrix replaces the hand-written axis cards and Pugh tables - the recorded milestone-readability fix.
