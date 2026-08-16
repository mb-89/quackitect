---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-scripting-api-over-loaded-index
type: "[[option]]"
statement: expose the loaded corpus as a programmatic API (filter/map/groupBy methods) instead of a declarative query syntax, and answer by running a short script
cluster: cluster-the-query
found_by: prior-art
source: "Obsidian Dataview's DataviewJS mode (github.com/blacksmithgu/obsidian-dataview README: \"dv.pages(...).where(...).groupBy(...)\")"
---

## Mechanism

No parser at all. The caller (or the query verb's own implementation) calls
`.where()`, `.groupBy()`, `.sort()` directly against an object the engine
already holds in memory, the way DataviewJS calls `dv.pages()`.

Cheapest to build — reuses whatever language the engine is already written
in — but fails the query-refuses-unknown-field and query-is-deterministic
requirements less cleanly than a closed grammar does: a script can express
anything, including things the corpus's four kinds do not support, and
catching that requires the same validation a declarative option gets for
free from having a fixed vocabulary.
