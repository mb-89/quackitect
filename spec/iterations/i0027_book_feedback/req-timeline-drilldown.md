---
id: req-timeline-drilldown
type: requirement
depends_on: []
statement: When the reader expands a timeline task, the timeline shall list its decisions, evidence, and trace elements grouped by type, each type expandable.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Drill-down (owner ruling, 2026-07-17)

- Iterations always show. Clicking an iteration always shows all its tasks.
- Clicking a task shows everything important that happened in it: decisions, evidence, and the trace elements created there.
- The contents render as a small list grouped by type. The reader expands the types that interest them.
- Filter pills (first draft) narrow what an expanded task shows, for example decisions only. The pills follow [req-filter-pill-rule](req-filter-pill-rule.md).
- Clicking any element fills the details pane and carries a link to the element's source.
- Type coloring follows the one shared palette ([req-type-colors](req-type-colors.md)).
- ON THE HAND-OFF (owner ruling, 2026-07-18): the separate milestone-verdict panel DISSOLVES into this drill-down. The tasks view is the one field: evidence hangs inside each task, open tasks are clickable, and the tasks currently under decision wear a yellow background so the deciding surface is unmistakable.

## Rationale (not load-bearing)
The task is where work happened; its drill-down is the audit trail read inline.
