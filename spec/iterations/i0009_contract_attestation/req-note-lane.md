---
id: req-note-lane
type: requirement
refines: [uc-deterministic-minting]
statement: Where a harness skill captures a note, the capture shall route through the engine's note lane, never a hand-written file.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
The note skill calls quack note (multi-line body via --file/stdin); only the CLI lane is deterministic today. Prompt change (note.md) + engine support.
