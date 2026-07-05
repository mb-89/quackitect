---
id: req-ratings-map
type: requirement
refines: [uc-spec-template]
depends_on: []
statement: The parser shall accept a one-level map value in node frontmatter and expose its entries to views.
class: review
killer: false
---
## Rationale (not load-bearing)
Candidate ratings live as a frontmatter map (ratings: criterion: score, 0..1); the owner ruled the parser gains this rather than parsing body tables. Strict-parse discipline holds: unknown keys still refuse, the map is one level deep only.
