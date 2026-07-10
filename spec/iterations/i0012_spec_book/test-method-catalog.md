---
id: test-method-catalog
type: test
statement: The method layer carries the methodology map and each chapter renders the methods that declare it.
class: executed
verify: selftest:method-map methods-view
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The methodology map exists in the method layer and the book renders it as a chapter with sources per method. *(was test-method-map)*
2. A fixture method note declaring applies_chapters renders in that chapter's methods view and in no other chapter. *(was test-methods-view)*
