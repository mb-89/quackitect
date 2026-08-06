---
id: req-unchanged-scope-answers-from-record
type: "[[requirement]]"
statement: "When a named scope other than the full battery holds no content change since its last green run, the engine shall answer from the recorded verdict, saying no new question was asked."
kind: functional
verify_method: test
breaks_if_removed: "Green-again runs pass as diligence, and reassurance spends the suite's meaning."
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests ext 6a
  - ".se/req-mine-v1.md: tests and the battery"
priority: should
---
