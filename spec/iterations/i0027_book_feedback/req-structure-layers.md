---
id: req-structure-layers
type: requirement
depends_on: []
statement: The book shall route the reader from the context model into a quack structural model, and from its determinizer element into the onion.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The reading path (owner ruling, 2026-07-17)

1. The reader starts at the CONTEXT model: quack as a black box, neighbors around it, interfaces crossing the boundary ([req-interface-notes](req-interface-notes.md)).
2. Entering quack opens a NEW structural model that describes quack OVERALL. It does not exist yet; this iteration creates it. It holds every part of quack, not only the Go software: the engine, the method resources, the launcher, and whatever else the modeling session allocates.
3. The onion describes ONLY the determinizer, the Go software we wrote. Entering the determinizer element of the structural model opens the onion.
4. The onion is NOT the layer directly under the context model. The structural model sits between them.
5. These models are design input. The implementation follows them, top-down, under the existing conformance discipline (uc-model-conformance).
6. Navigation uses the onion's interaction rules: single click details, enter to descend, browser back to ascend ([req-onion-click](req-onion-click.md), [req-onion-enter](req-onion-enter.md)).

## Rationale (not load-bearing)
Three altitudes, three models: black box, whole product, written software. Each answers one question and hands the reader down to the next.
