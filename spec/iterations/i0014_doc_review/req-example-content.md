---
id: req-example-content
type: requirement
depends_on: []
statement: Where a reader-facing view would otherwise render empty, the book shall ship a clearly-marked example the author can replace or delete.
class: review
killer: false
ears: exempt - authored and shipped at lean rigor (i14); blessed history, never retrofitted (adr-grandfathers-historical)
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
owner ruling 2026-07-08: an empty view teaches nothing; a marked example shows the author the shape to author and is safe to delete. Applies to guides, rules, and any ex- seeded note. All documentation - not architectural.
