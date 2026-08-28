---
minted_in: i1
id: req-test-result-is-structured
type: "[[requirement]]"
statement: The engine shall report every test run as totals with each failure carrying its failing assertion.
kind: functional
verify_method: test
breaks_if_removed: The verdict rides raw output through a truncating pipe, and the end that carries it is exactly what gets cut.
breaks_how_badly: crippling
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests step 3
priority: must
---

## Detail

| field | carries |
| --- | --- |
| totals | pass, fail, and skip counts for the scope |
| failure | the test name, the failed assertion, and its location |
| ref | the full raw output, fetchable by reference |
