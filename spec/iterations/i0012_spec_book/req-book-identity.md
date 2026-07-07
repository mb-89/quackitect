---
id: req-book-identity
type: requirement
depends_on: []
statement: The book shall name the exact spec state it renders - the merkle root, the active iteration, and the engine version are stamped in the artifact.
class: review
killer: false
phase: [engineering]
discipline: [design]
quality: [functionality]
---
## Rationale (not load-bearing)
Reproducibility practice (prior-art check at M2): the artifact identifies its source state. The merkle root exists; the stamp makes "hash-backed" literal - every claim in the book is anchored to the gated state it was rendered from. Pairs with req-book-drift (same state, same bytes).
