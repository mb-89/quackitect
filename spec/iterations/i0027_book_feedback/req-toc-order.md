---
id: req-toc-order
type: requirement
depends_on: []
statement: Where a table-of-contents manifest exists, the book shall order the chapters and decks by it, and a chapter shall not carry its own position.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling 2026-07-19 (the layout rework session) - the position lives in the toc, hand-editable
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Rationale (not load-bearing)
The owner edits the book's structure by hand. One file says what goes where, as nested markdown lists; a note never knows its own position. The order frontmatter stays the fallback for workspaces without a toc. A chapter the toc misses appends at the end, visibly, never silently.
