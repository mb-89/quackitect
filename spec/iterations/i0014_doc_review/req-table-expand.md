---
id: req-table-expand
type: requirement
depends_on: []
statement: The book shall render every reader-facing table row collapsed to the item name, expand a clicked row to the item's full content, offer expand-all and collapse-all controls, and page a need-scoped table by need with at most twenty rows per page.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
Owner ruling at the bs20 design discussion (2026-07-08): the reading flow is as deep or shallow as the reader wants. The expanded row is the item's ONLY rendering in its chapter (DRY) - no separate prose rendering of items. An item under several needs appears on each need page. Items outside any need cone page plain with the twenty-row cap.
