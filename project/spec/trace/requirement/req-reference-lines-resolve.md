---
id: req-reference-lines-resolve
type: "[[requirement]]"
statement: "If a reference field's line names zero existing nodes, then the engine shall refuse the line and name the type's template in the refusal."
kind: functional
verify_method: test
breaks_if_removed: "A dangling name enters the trace, and the coverage matrix counts a ghost."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step ext 4a
priority: should
---
