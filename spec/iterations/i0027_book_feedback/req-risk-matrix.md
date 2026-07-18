---
id: req-risk-matrix
type: requirement
depends_on: []
statement: The book shall render RAID items as bubbles on a continuous matrix, impact on the x axis and probability on the y axis, both zero to one.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The matrix (owner ruling, 2026-07-17)

- One continuous matrix for every RAID item. Impact on x, probability on y, both zero to one. The owner's ruling flips the axes named in the i26 handover note.
- One bubble per item. Bubble COLOR encodes the KIND: risk, assumption, issue, dependency. Severity carries no color; position already says it.
- The kind is a filter dimension: pills for risk, assumption, issue, dependency, per the generic mechanism in [req-filter-pill-rule](req-filter-pill-rule.md).
- Status is a second filter dimension: open or closed. Closed items hide by default.
- Clicking a bubble shows the item's details in the details pane.
- Consequence for the data: every RAID node carries probability and impact so it can plot. An issue's probability may be one; it has occurred.

## Rationale (not load-bearing)
A continuous probability-consequence diagram beats the discrete colored grid: no risk ties, full resolution (DTU recommendations; sources in the M2 evidence doc). One matrix over all four kinds replaces both the quadrant-board idea and a risks-only lens: the kind filter gives each kind its view for free.
