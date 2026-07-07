---
id: adr-deterministic-mint
type: adr
adjudicated_by: human
statement: Node and note creation is engine-owned — `quack mint <type>` emits schema-valid skeletons (with sugar forms mint veto / mint defer --ready-when / mint supersede stamping the classification edges), and the note skill calls the engine's note lane (multi-line body via file or stdin) instead of hand-writing files — chosen over graduation-only minting (conflates the private note lane with trace minting, no path for tests or requirements).
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Moves the strict parser's guarantee from read time to birth time. The sebot determinizer precedent, applied. This session's hand-written notes are the drift it removes.
