---
id: req-type-colors
type: requirement
depends_on: []
statement: The engine shall draw each node type's color in every render from the one palette source in the design language.
class: review
killer: false
kind: quality
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: quality - visual consistency across every surface
---
## The rule (owner ruling, 2026-07-17)

- One color per node type, identical everywhere: trace graph, report, book, timeline drill-down, register, RAID matrix.
- The single source is the design language: the type-colors list in `product/brand/palette.md`.
- The engine resolves colors from that source. No render carries its own literal.
- This binds RAID kinds and new types (function, question) the same way: their color enters the palette before any render uses it.
- Today's state is the defect: the same six hex literals are duplicated across the report CSS, the graph style, and the book CSS.

## Rationale (not load-bearing)
A type the reader learned in one view must mean the same thing in every view. Duplicated literals drift; a single resolved source cannot.
