---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: fn-run-a-governed-walk.record-a-coupling-disposition
type: "[[function]]"
statement: record a disposition for each candidate coupling
satisfies:
  - req-bm25-candidates-need-disposition
inputs:
  - flow-candidate-list
outputs:
  - flow-coupling-disposition
source_refs:
  - uc-dispose-of-a-candidate-coupling
---

## Rationale

Split from ranking rather than folded into it: ranking is a read over the
corpus, disposing is a judgment about each result, and the verb-plus-noun
test tells them apart cleanly (rank vs. record). Keeping them separate also
keeps the forced-disposition guarantee traceable to one function rather
than buried as a side effect of ranking.
