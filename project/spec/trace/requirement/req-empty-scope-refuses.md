---
id: req-empty-scope-refuses
type: "[[requirement]]"
statement: "If a named scope holds no test file, then the engine shall refuse the run with the available suites listed."
kind: functional
verify_method: test
breaks_if_removed: "A typo in the scope silently runs everything, and the answer stops matching the question."
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests ext 2a
  - ".se/req-mine-v2.md: errors and refusals"
priority: should
---

## Detail

## Detail

- The refusal carries an executable remedy: the corrected call with a real suite named.
