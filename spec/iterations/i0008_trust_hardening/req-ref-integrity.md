---
id: req-ref-integrity
type: requirement
refines: [uc-fail-loud-parsing]
statement: When the engine loads the graph, it shall verify that every declared reference (depends_on, refines, implements, verifies, addresses, parent, validates) resolves in both directions to existing nodes, and shall exit nonzero naming any dangling reference.
depends_on: []
class: review
killer: false
---
