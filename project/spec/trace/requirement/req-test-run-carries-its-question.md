---
id: req-test-run-carries-its-question
type: "[[requirement]]"
statement: The engine shall record every test run with the question and scope it was asked to answer.
kind: functional
verify_method: inspection
breaks_if_removed: A later reader cannot tell what question a run answered, and reassurance runs are indistinguishable from questions.
breaks_how_badly: abrasive
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests step 1
priority: could
---
