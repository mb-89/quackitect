---
id: test-base-view-queries
type: test
statement: Deterministic base view queries evaluate over node data including map values.
class: executed
verify: selftest:base-views ratings-map
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A fixture base block filters, sorts, limits, and groups with counts over fixture notes deterministically - two evaluations are byte-identical; a volatile function and an out-of-subset construct each refuse with an error. *(was test-base-views)*
2. A node with a one-level frontmatter map parses; its entries are readable; a two-level map refuses; unknown top-level keys still refuse. *(was test-ratings-map)*
