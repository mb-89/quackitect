---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-shard-index-by-node-type
type: "[[option]]"
statement: split the query index into one shard per node type, each with its own fixed field vocabulary, instead of one flat store over every kind
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: analogy
source: library card catalogues — MARC's fixed tag/subfield vocabulary per bibliographic type, one drawer per subject
---

## Mechanism

Abstracted one level: showing a large, self-describing collection through a
narrow, named-field lens, refusing anything not on the label. Libraries have
solved this for over a century by never using one universal record shape —
a serial's catalog card carries different fixed fields than a monograph's.

Transferred here: `type: requirement` gets one fixed field vocabulary,
`type: function` gets another, each its own shard. A query for an unknown
field is a lookup against a smaller, type-specific list rather than the
whole corpus's superset — cheaper to check, and the refusal names a shorter
list.

What did NOT transfer: a card catalogue is a read-only artifact a
professional cataloguer rebuilds on a slow, deliberate cadence. Our corpus
changes on every lane write, so the "rebuild is rare and careful" half of
the analogy has no equivalent here — sharding buys a smaller search, not a
cheaper rebuild.
