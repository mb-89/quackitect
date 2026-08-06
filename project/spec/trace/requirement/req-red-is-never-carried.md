---
id: req-red-is-never-carried
type: "[[requirement]]"
statement: "If a test run returns a failure, then the engine shall hold the walk until the failure's resolution is recorded."
kind: functional
verify_method: test
breaks_if_removed: "A red gets marked known-broken and ridden past, and the suite stops answering questions."
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests step 4
  - uc-answer-a-question-with-tests step 5
  - uc-answer-a-question-with-tests ext 4a
  - uc-answer-a-question-with-tests guarantee
priority: must
---

## Detail

## Detail

- No known-broken marker exists to park a red under.
- A resolution is one of two: the code fixed, or the test corrected where it asserted a rule that no longer holds.
- The resolution record names which of the two happened.
