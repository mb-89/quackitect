---
id: req-provenance-icons
type: requirement
depends_on: []
statement: The book shall render every AI-drafted paragraph with its provenance marks - the count starts at three when the AI drafts it, only the user reduces it, and an unreduced edit overstates AI involvement, never understates it.
class: review
killer: false
phase: [engineering]
discipline: [design]
quality: [functionality]
---
## Rationale (not load-bearing)
Owner ruling (M1): three "ai written" icons per AI draft; user corrections may reduce the count. The AI side is structural (the pipeline stamps at write time, per req-ai-drafting); the human side is deliberately unpoliced (owner ruling). The stated failure direction makes the honor system defensible: an edited-but-unreduced paragraph overstates AI involvement - the harmless direction, like the actor stamps. Icon SEMANTICS (decrement ladder vs independent review axis; the ledger-as-Evaluation synthesis) is an M3 candidate axis; a bare textual "AI" label is the research-proven worst format and is excluded.
