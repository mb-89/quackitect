---
id: req-comment-mark-prose
type: requirement
depends_on: []
statement: When a reader selects prose in a book copy, the comment layer shall anchor the new comment to the enclosing unit anchor with quote and position selectors.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [functionality, usability]
---
## Rationale (not load-bearing)
Unit anchors are stable per render; quote+position disambiguate inside the unit. No cross-version re-attach (owner: fdf-style loss accepted).
