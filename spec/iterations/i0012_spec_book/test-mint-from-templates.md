---
id: test-mint-from-templates
type: test
statement: quack mint stamps field-complete skeletons from the templates for every item kind and milestone evidence doc.
class: executed
verify: selftest:mint-all-kinds mint-skeleton
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Every item kind mints a skeleton containing its template's declared fields; no skeleton says human where user is the vocabulary. *(was test-mint-all-kinds)*
2. quack mint stamps an evidence-doc skeleton for the active milestone from its template; an existing doc is never overwritten. *(was test-mint-skeleton)*
