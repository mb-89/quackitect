---
id: req-facet-board
type: requirement
depends_on: []
statement: The book shall render a requirements coverage board - one count per facet value from the type layer's vocabularies, a zero count visible as a hole, each count filtering the register on selection - and the engine shall refuse a facet value absent from the vocabulary.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Requirements carry multi-valued facets (phase, discipline, quality); vocabularies live in the type layer (blessed sets 2026-07-05: phase and discipline extend by type, quality is type-independent ISO 25010 + safety + regulatory). The board upgrades the Hauptmerkmalliste from a checklist comment to live coverage. Click-through is a CSS filter on the once-rendered register (DOM-static safe). Facet tagging is accepted, expected work the AI does (owner ruling).
