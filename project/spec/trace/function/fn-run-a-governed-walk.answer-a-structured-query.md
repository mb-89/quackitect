---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: fn-run-a-governed-walk.answer-a-structured-query
type: "[[function]]"
statement: answer a structured query over the corpus
satisfies:
  - req-query-returns-named-fields
  - req-query-refuses-unknown-field
  - req-query-empty-result-explicit
  - req-query-is-deterministic
inputs:
  - flow-query-request
outputs:
  - flow-query-result
  - flow-refusal
source_refs:
  - uc-query-the-corpus-by-structure
  - uc-get-a-trustworthy-answer
---

## Rationale

Its own function rather than folded into an existing sibling, because
nothing today reads the corpus as typed rows against named fields —
se_file_search and se_file_glob answer with matching TEXT, a different
flow entirely. Determinism rides the same function rather than a sibling
of its own: it is a property of how this one function behaves given the
same request twice, not a second thing the system does.
