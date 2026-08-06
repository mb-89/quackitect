---
id: req-scoped-run-stays-in-scope
type: "[[requirement]]"
statement: "When a test run names a scope, the engine shall execute zero tests outside that scope."
kind: functional
verify_method: test
breaks_if_removed: "Every question triggers the whole suite, and the answer drowns in unrelated noise."
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests step 2
priority: must
---
