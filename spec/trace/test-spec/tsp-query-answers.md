---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-query-answers
type: "[[test-spec]]"
statement: The query verb returns exactly the requested fields on matching rows, refuses an unknown field by name, answers an empty match explicitly, and repeats identically on an unchanged corpus, verified by test over el-query-evaluator.
method: test
verifies:
  - req-query-returns-named-fields
  - req-query-refuses-unknown-field
  - req-query-empty-result-explicit
  - req-query-is-deterministic
files:
  - tests/query.test.ts
---

## Scope

The query verb (fn-run-a-governed-walk.answer-a-structured-query) end to
end: a matching request, an unknown field, an empty match, and a repeat
call. The corpus-wide analysis claims (view derivation, capability
coverage) are tsp-derivation-analysis, not here.

## Approach

Component level, over minted fixture nodes rather than the real corpus —
determinism and field-shape are properties of the evaluator, not of any
one real node. Equivalence classes: a matching filter, a filter matching
nothing, a legal field, an illegal field. Depth is high: three of the
four requirements are graded crippling or a must, per
req-query-refuses-unknown-field and req-query-returns-named-fields.

## Steps

Every case in `tests/query.test.ts` is one step, and the case name states
its claim. All four are RED today: answerStructuredQuery
(engine/query.ts) throws until build-steps lands it. Writing them red is
the point (meth-test-first) — cand-explicit-and-safe was chosen partly on
this axis, and a red case here is that choice made checkable.
