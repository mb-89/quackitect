---
id: req-diagram-review-render
type: requirement
depends_on: []
statement: The engine shall render one model as a standalone diagram whose change-marks propagate up the drill-down. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When an architect requests a model render with marked elements, the engine shall emit a standalone diagram in which each marked element's cluster and layer are themselves marked.
2. The engine shall auto-mark every model element that has no realized code yet, and shall accept an explicit mark list for changed-but-existing elements.
3. The engine shall emit the render as one self-contained HTML file that makes no external request.
