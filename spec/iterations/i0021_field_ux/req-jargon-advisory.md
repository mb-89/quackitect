---
id: req-jargon-advisory
type: requirement
statement: When reader-facing prose carries a capitalized or acronym token that is no glossary term, quack lint shall report an advisory jargon finding.
class: review
killer: false
---
## Rationale (not load-bearing)
Lint blind spot 2 (NOTE-20260712-175741): the glossary IS the term set (correct DRY), so an
unregistered term is invisible by construction. The heuristic pairs with it: candidate jargon
that is NOT in the glossary gets an advisory - the author either registers the term or rewords.
Advisory class; prose judgment stays with the author.
