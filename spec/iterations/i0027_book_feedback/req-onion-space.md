---
id: req-onion-space
type: requirement
depends_on: []
statement: Where a chapter figure hosts the interactive onion, the book shall render the figure beyond the prose column, using the viewport width beside the sidebar.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling 2026-07-19 (the M6 reopen, item 14 - the render does not use its space)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Rationale (not load-bearing)
The prose column caps at 1040px for reading measure. The onion is a diagram, not prose. On a wide screen the cap wasted most of the viewport. Fullscreen mode is excluded from the breakout so the fixed modal keeps working.
