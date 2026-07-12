---
id: req-deck-discoverable
type: requirement
depends_on: [req-deck-links]
statement: The walkthrough deck shall be reachable from the guides table and from the README - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The guides table shall carry one row linking the walkthrough deck by its anchor, typed honestly as a deck row among the guide rows.
2. The README shall link the walkthrough deck by its anchor from its further-reading references.

## Rationale (not load-bearing)
The remaining two sides of the owner's discoverability triangle (the onboarding chapter is the
third, bound in req-onboarding-chapter.2). Both consume the anchor req-deck-links provides -
hence the depends_on.
