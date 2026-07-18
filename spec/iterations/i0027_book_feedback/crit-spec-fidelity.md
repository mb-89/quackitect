---
id: crit-spec-fidelity
type: criterion
metric: share of layout-spec rules the render honors without exception (0-1)
target: every rule of onion-io-layout, the deck arc, and the matrix spec renders as drawn
statement: The axis weighs how exactly a candidate renders the committed layout specs: the onion drawing, the deck arc, the matrix.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
---
## Rationale (not load-bearing)
Weight 0.30 - the iteration exists to land the field findings; fidelity to the owner's committed specs outweighs every other axis.
