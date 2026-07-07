---
id: test-migrate-edges
type: test
statement: migrate-edges on a fixture converts every edge, prints the audit counts, and refuses on an injected duplicate entry and on an injected adjacency mismatch; the mode flag is written last.
class: executed
verify: selftest:migrate-edges
killer: false
---
