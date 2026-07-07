---
id: req-external-links
type: requirement
depends_on: []
statement: If an external link appears in spec content outside a reference note, then quack lint shall flag it as a violation.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [compatibility]
---
## Rationale (not load-bearing)
The pull law of the fundamentals chapter: an outside source is wrapped in a reference note (kind normative|informative, version, accessed), the body links the note, ch2 derives the list of used references. The spec body becomes externally link-free by rule, not by discipline.
