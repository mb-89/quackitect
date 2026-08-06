---
id: req-dead-link-fails-the-gate
type: "[[requirement]]"
statement: "If a node's link points at a file that does not exist, then the engine shall count the node defective and fail the gate reviewing it."
kind: functional
verify_method: test
breaks_if_removed: "A rename leaves silent dead ends, and the trace rots link by link."
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin ext 4a
priority: should
---
