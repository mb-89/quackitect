---
id: req-model-kinds-catalog
type: requirement
depends_on: []
statement: The book shall derive the model-kinds section from the templates: prose from the template, the template rendered small, and the kind's uses. A kind used nowhere shall not render.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## The catalog mechanism (owner ruling, 2026-07-17)

Section 10.6 derives per model kind, from the kind's template in `method/models/`:

1. PROSE: what this kind is, taken from the template body. The prose lives in the template, once.
2. A RENDER of the template itself, as a small model.
3. A USE LIST: every declared model of this kind in the book, linked.

Extending 10.6 means adding one template file. Nothing else.

A kind with a template but no use anywhere does not render.

Consequence for the templates: each carries a small renderable example, so item 2 has something to draw. Today's templates carry prose but no example fence; the build adds them.

First kind walked (owner): CONTEXT. The existing context model is good and stays. Its defect is only that 10.6 never rendered it; this catalog fixes that.

## Rationale (not load-bearing)
The registry file is already the single source for kinds (the file IS the registration). The catalog extends the same principle to the chapter: the template is the single source of kind prose, example, and membership.
