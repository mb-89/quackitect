---
id: req-ch3-needs-intro
type: requirement
depends_on: []
statement: The book shall open the design-input chapter with IFU prose and a reference to the design-input register, not a needs list.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Design decision (owner, 2026-07-17)

- The needs list is too technical to open chapter 3.
- Chapter 3 keeps prose: IFUs show what users can do, each IFU tells a user story, the idea composes into needs.
- Chapter 3 drops the needs list. It references the chapter-6 design-input register instead.

## Rationale (not load-bearing)
The register in chapter 6 is the one home for design-input items. Chapter 3 points there rather than repeating a technical list.
