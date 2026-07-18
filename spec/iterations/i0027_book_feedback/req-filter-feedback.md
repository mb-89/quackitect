---
id: req-filter-feedback
type: requirement
depends_on: []
statement: When a reader applies a view filter, the book shall jump to the readme, show the filter in the filter field, ping around it, and gray every irrelevant unit.
class: review
killer: false
kind: functional
provenance:
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
  statement: skeleton value
---
## The filter round-trip (owner ruling, 2026-07-18)

- The README is NEVER filtered. It is always in, whatever the filter.
- Applying any view filter jumps the reader to the README - the stable ground from which the filtered world is surveyed.
- The applied filter shows in the filter field, and the field announces it with the attention ping ([req-details-full-entry](req-details-full-entry.md): three border echoes, 3vmax travel, border color).
- EVERYTHING irrelevant under the filter grays out - the defect observed today: the current chapter stayed ungrayed.

## Rationale (not load-bearing)
A filter that leaves you where you stood, with nothing visibly changed and the current chapter not even grayed, reads as a dead click. The jump plus the ping plus honest graying make the filter's effect unmistakable.
