---
id: req-note-lane
type: requirement
statement: Where a harness skill captures a note, the capture shall route through the engine's note lane, never a hand-written file.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
The note skill calls quack note (multi-line body via --file/stdin); only the CLI lane is deterministic today. Prompt change (note.md) + engine support.
