---
id: req-project-timeline
type: requirement
depends_on: []
statement: The book, the report, and the handover shall render iterations through one shared timeline renderer.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## One renderer, three frames (owner ruling, 2026-07-17)

- Today several timeline renderers exist. One survives: the HANDOVER pager's, with its drill-down (iteration, then tasks, then evidence).
- The same component renders everywhere. Only the frame differs.
- Handover: one iteration, phone-width card, as today. No iteration-level scroll; elements inside the iteration may scroll.
- Report: the sidebar frame.
- Book: width unconstrained, all iterations.
- Drill-down behavior: [req-timeline-drilldown](req-timeline-drilldown.md). Anchoring and scroll: [req-timeline-anchor](req-timeline-anchor.md).
- The RAID matrix is separate: [req-risk-matrix](req-risk-matrix.md).

## Rationale (not load-bearing)
One renderer kills the drift between three hand-maintained timelines.
