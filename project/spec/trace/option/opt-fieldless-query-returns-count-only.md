---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-fieldless-query-returns-count-only
type: "[[option]]"
statement: a query naming no field list returns just a row count, never full rows
cluster: cluster-the-query
found_by: transform
source: "SCAMPER Modify (minify), held against answer-a-structured-query's response shape"
---

## Mechanism

Minify the common existence-check case: "how many requirements are
`must`" does not need every field of every match, only a number.

Whichever internal option wins, a fieldless request could short-circuit
before any row is built at all — cheaper than the full-field path by
construction, and it never risks returning more than the caller asked for.
Costs one more shape for req-query-is-deterministic to cover.
