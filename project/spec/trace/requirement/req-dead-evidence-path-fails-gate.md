---
id: req-dead-evidence-path-fails-gate
type: "[[requirement]]"
statement: "If a path cited in gate evidence resolves to no artifact, then the engine shall fail the gate on that finding alone."
kind: functional
verify_method: test
breaks_if_removed: "A bless lands on evidence nobody can open, and the trace behind the gate is fiction."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 4b
priority: should
---
