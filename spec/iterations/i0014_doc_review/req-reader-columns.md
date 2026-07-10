---
id: req-reader-columns
type: requirement
depends_on: []
statement: A reader-facing table shall show the item name and statement and shall not show filename, weight, or source-internal columns.
class: review
killer: false
ears: exempt - authored and shipped at lean rigor (i14); blessed history, never retrofitted (adr-grandfathers-historical)
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field cluster c11 c12 c17 c18 c22 c29 c31: reader does not care

Session refinement 2026-07-08 (c9 c10): a reader row shows NAME and a BRIEF one-liner only (a short description or statement; empty when the statement is long, like a requirement). Everything else is on expand, reached by a disclosure triangle. Filter and buttons sit BELOW the table, right-aligned; pagination is configurable, default 20.
