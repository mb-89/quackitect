---
id: req-test-scope-discipline
type: "[[requirement]]"
statement: When a test run names a scope, the engine shall run exactly that scope and shall answer from the recorded verdict where the scope has not changed.
kind: functional
verify_method: test
verified_by:
  - "tests/discipline.test.ts :: the unchanged gate is PER SCOPE — pull's green does not fence files' run"
  - "tests/discipline.test.ts :: piecemeal past the threshold flips: scoped refuses toward the battery, the battery is granted"
breaks_if_removed: Tests run to reassure rather than to answer, and the battery's cost buys nothing.
breaks_how_badly: corrosive
refines:
  - uc-land-work-on-trunk
  - uc-let-the-system-catch-up
  - uc-answer-a-question-with-tests
  - uc-answer-a-question-with-tests
source_refs:
  - uc-land-work-on-trunk ext 3b
  - uc-let-the-system-catch-up step 5
  - ".se/req-mine-v1.md: tests and the battery"
  - ".se/req-mine-v2.md: spec discipline"
  - uc-answer-a-question-with-tests ext 6b
  - uc-answer-a-question-with-tests step 2
  - uc-answer-a-question-with-tests ext 2a
  - ".se/req-mine-v2.md: errors and refusals"
  - uc-answer-a-question-with-tests ext 6a
priority: must
---

## Detail

The scope rules:

- The engine shall refuse a full-battery run outside the states that earn it and name the scoped lane in the refusal.
- When a test run names a scope, the engine shall execute zero tests outside that scope.
- If a named scope holds no test file, then the engine shall refuse the run with the available suites listed.
- When a named scope other than the full battery holds no content change since its last green run, the engine shall answer from the recorded verdict, saying no new question was asked.
