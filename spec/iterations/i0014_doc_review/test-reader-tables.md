---
id: test-reader-tables
type: test
statement: Every reader-facing query renders as a compact, in-place filterable, expandable table.
class: executed
verify: selftest:glossary-table reader-columns table-noise table-render
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The glossary renders as a filterable, sortable table. *(was test-glossary-table)*
2. No reader-facing table carries a filename, weight, or source-internal column. *(was test-reader-columns)*
3. Zero counts render uncolored and no empty-value bucket row appears. *(was test-table-noise)*
4. Every query renders a table with a header row and cell separation, including zero-row queries. *(was test-table-render)*
