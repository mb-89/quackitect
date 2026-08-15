---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-first-green-needs-a-red
type: "[[requirement]]"
statement: If a test reaches its first green with no recorded red and no recorded exemption, then the engine shall withhold the verdict and flag the test.
kind: functional
verify_method: test
breaks_if_removed: A test that never failed proves nothing, and a fabricated pass enters the record as an answer.
breaks_how_badly: crippling
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - uc-answer-a-question-with-tests step 4
  - ".se/req-mine-v1.md: tests and the battery"
priority: should
weighs_against:
  - req-parallel-iterations-own-worktrees >
---

## Detail

## Detail

- A test whose red was never observable records its exemption citing a decision, not a red observation.
