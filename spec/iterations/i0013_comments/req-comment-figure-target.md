---
id: req-comment-figure-target
type: requirement
depends_on: []
statement: When a reader marks an element inside a figure, the comment layer shall anchor the comment to that element's id.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
The figures are real-text inline SVG (225 in the current book); sub-element ids are addressable.
