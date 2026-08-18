---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-closed-field-grammar-makes-unknown-fields-unparseable
type: "[[option]]"
statement: define the legal field list per node kind as a closed grammar, so an unknown field fails to PARSE rather than being checked and rejected after parsing
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: heuristic
source: 'meth-heuristics-catalog: "Make the illegal unrepresentable, not merely checked."'
---

## Mechanism

req-query-refuses-unknown-field can be satisfied two ways: parse whatever
field name arrives, then look it up and refuse if it is not on the list; or
generate the parser itself from the closed field list per kind, so a query
naming an unlisted field is a syntax error before any lookup runs.

The second is stronger — there is no code path where an unknown field
reaches a runtime check at all, because the grammar cannot produce that
token. Costs regenerating the parser (or its accepted-token table) whenever
a kind's field list changes, which the pinned subset already ties to a
deliberate, test-first extension per adr-query-in-engine.
