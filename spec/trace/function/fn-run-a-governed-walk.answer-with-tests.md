---
minted_in: i1
id: fn-run-a-governed-walk.answer-with-tests
type: "[[function]]"
cluster: the-record-life
statement: answer one question about a change by running the narrowest scope that settles it
satisfies:
  - req-the-full-battery-runs-where-the-method-says
  - req-scoped-run-records-its-timings
  - req-test-run-carries-its-question
  - req-story-links-its-proving-run
  - req-test-scope-discipline
  - req-test-result-is-structured
  - req-red-is-never-carried
  - req-first-green-needs-a-red
  - req-a-red-is-an-assertion-not-a-crash
  - req-a-diff-no-test-answers-for-is-reported-not-swept
inputs:
  - flow-test-question
  - flow-worktree
outputs:
  - flow-battery-verdict
  - flow-test-timings
  - flow-work-under-way
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

AND SO IS TELLING AN ASSERTION FROM A CRASH (i6). A check that crashes
from birth proves as little as one that is green from birth — it never
reached its expectation, so nothing about the design was measured. The
counts cannot tell the two apart and the run's own report can, which puts
the distinction with the thing that ran it.

SAYING NOTHING ANSWERS IS PART OF ANSWERING (i51). This function's statement
already promises the NARROWEST scope that settles a question, and the narrowest
scope for a change nothing covers is no scope at all.

Running everything in that case is not a wider answer. It is a different
question answered instead, and the caller cannot tell the two apart from the
verdict.

So naming the parts nothing answers for belongs here rather than in a function
of its own. It is the same act — deciding what settles the question — reaching
the honest end of its own range.
