---
id: req-split
type: requirement
refines: [uc-review-report]
statement: The trace is a FIXED 5-layer V-model of typed nodes: need, use-case (or user-story), requirement, design, and test. Display order is top-down, test last. A requirement is tagged functional or non-functional. The edges are semantic. A use-case refines a need. A requirement refines a use-case. A design implements a requirement. A test verifies a requirement. The V hinges at the requirement. A node names its parent's id in the matching field. There is no same-type refinement. Depth is fixed at five. More or fewer is a modelling error. Tasks are prefixed instance data (TASK-/MARK-). They are separate from the trace and excluded from it, with no per-node link.
depends_on: []
class: review
killer: true
---

## Rationale (not load-bearing)
M2 killer. Typed V-model trace + trace/task separation. Edges are semantic (refines / implements /
verifies) — a test traces to the requirement it verifies (ISO 29148 / DO-178C). Requirements in EARS;
qualities are non-functional requirements (ISO 25010). Architecture is design prose, not a trace node.
