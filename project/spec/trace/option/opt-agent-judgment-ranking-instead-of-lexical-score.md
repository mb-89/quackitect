---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-agent-judgment-ranking-instead-of-lexical-score
type: "[[option]]"
statement: rank candidates by asking an agent to judge resemblance to the change description, instead of a lexical score like BM25
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: transform
source: SCAMPER Substitute, held against "what scores a candidate"
---

## Mechanism

Swap the scorer: instead of a lexical/statistical score, an agent reads the
change description and each candidate and returns a judgment.

Recorded for completeness, but it already conflicts with requirements that
name BM25 specifically (req-bm25-returns-ranked-candidates and siblings,
per derive-functions' own note that scope-non-goals committed to BM25 at
M1). rank-candidate-couplings itself stays neutral about the ranking
method; the requirements sitting under it do not. Likely pruned at M5 for
that reason, and recorded here rather than silently skipped.
