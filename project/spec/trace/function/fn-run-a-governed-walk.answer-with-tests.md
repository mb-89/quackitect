---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: fn-run-a-governed-walk.answer-with-tests
type: "[[function]]"
cluster: the-record-life
statement: answer one question about a change by running the narrowest scope that settles it
satisfies:
  - req-scoped-run-records-its-timings
  - req-test-run-carries-its-question
  - req-test-scope-discipline
  - req-test-result-is-structured
  - req-red-is-never-carried
  - req-first-green-needs-a-red
inputs:
  - flow-test-question
  - flow-worktree
outputs:
  - flow-battery-verdict
  - flow-test-timings
controls:
  - the tree's own change, which decides whether a rerun proves anything
  - the held walk, while a red stands unresolved
source_refs:
  - uc-answer-a-question-with-tests
---

## Rationale

A test run here is a QUESTION, not a ritual, and that is why it is its own
function rather than part of judging a claim.

Judging asks whether a claim's shape is right. This asks whether the world
still behaves. The two share nothing but the word check.

Withholding a first green that never went red belongs here for the same
reason: it is a statement about what the run PROVED, which only the thing
that ran it can know.
