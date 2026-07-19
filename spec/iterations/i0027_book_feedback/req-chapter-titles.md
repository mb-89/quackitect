---
id: req-chapter-titles
type: requirement
depends_on: []
statement: Where a chapter statement carries a subtitle, the book shall render only the short title in the heading and the remainder as a separate subtitle line.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling 2026-07-19 (the M6 reopen, items 2 and 5 - headings leaked statements)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Rationale (not load-bearing)
The split rule cuts at the earliest dash or sentence end. Chapter numbers derive at render, so the fundamentals split renumbered later chapters for free; content references chapters by link, never by number.
