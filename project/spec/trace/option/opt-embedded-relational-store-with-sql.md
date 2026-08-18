---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-embedded-relational-store-with-sql
type: "[[option]]"
statement: load nodes, edges, states and notes into an embedded relational store and answer the query as SQL over real tables
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: prior-art
source: the relational query model generally (SQL SELECT/WHERE/named columns); embeddable engines such as SQLite are the common implementation
---

## Mechanism

Every node kind becomes a table; every flow or edge becomes a join. The
query verb translates the caller's request (kind, filter, field names) into
a parameterised SELECT and returns rows straight from the engine.

The named-field guarantee and the deterministic-answer requirement both fall
out of the relational model for free — a SELECT either returns the same rows
or it does not compile. The cost is real: an index build/refresh step on
every corpus change, and a second source of truth for data that already
lives in markdown files, which the neutrality note on answer-a-structured-query
already flags as a live tension for whichever option wins.
