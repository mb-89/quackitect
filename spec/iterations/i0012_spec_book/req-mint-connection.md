---
id: req-mint-connection
type: requirement
depends_on: []
statement: When quack mint connection runs with a kind, src, and dst, the engine shall create the edge once in the kind's default lane, with a deterministic id, canonical endpoint order for a symmetric kind, and a stamped statement on the note lane.
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
Housekeeping is determinizer-owned (owner ruling): deterministic id con-<kind>--<src>--<dst>, idempotent re-mint, lexicographic src/dst for symmetric kinds.
