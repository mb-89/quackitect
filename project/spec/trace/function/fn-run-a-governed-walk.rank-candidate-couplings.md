---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: fn-run-a-governed-walk.rank-candidate-couplings
type: "[[function]]"
cluster: the-disposition
statement: rank candidate coupled nodes against a described change
satisfies:
  - req-bm25-returns-ranked-candidates
  - req-bm25-below-threshold-returns-empty
inputs:
  - flow-change-description
outputs:
  - flow-candidate-list
source_refs:
  - uc-dispose-of-a-candidate-coupling
---

## Rationale

Its own function because it answers a different question than the
structured query: not "what matches these named fields" but "what in
the corpus, that no edge already names, resembles this change". The
trace graph already answers named structural coupling; this is what
gate-kickoff's own framing called answering the rest.
