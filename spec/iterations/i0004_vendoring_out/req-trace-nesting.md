---
id: req-trace-nesting
type: requirement
refines: [uc-review-board]
statement: Build steps nest under a single build parent and tests under a generic testing parent (a third level in the milestone->subtask render), in dependency order. engage seeds build/test subtasks under those parents; the report renders and collapses the hierarchy.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
From the inbox: reflects the real hierarchy; improves readability. Partially present (i3 build parent); this completes the render + seeding.
