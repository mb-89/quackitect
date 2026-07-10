---
id: test-item-domain-fields
type: test
statement: Each item kind declares its domain fields and the views render them.
class: executed
verify: selftest:need-item note-tags quality-scenarios stakeholder-links verify-method
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The need template declares source and acceptance fields; the needs view renders both columns for a fixture need. *(was test-need-item)*
2. A tagged fixture rationale loads strict-clean and a file.hasTag query filters to it. *(was test-note-tags)*
3. A quality requirement carrying the six scenario fields loads strict-clean and the qualities view renders it grouped by its quality facet. *(was test-quality-scenarios)*
4. A stakeholder note with preset and guide fields loads strict-clean and the matrix view renders concern, preset, and guide columns. *(was test-stakeholder-links)*
5. A test item with method and level renders both in the verification matrix; the requirement item template carries verify_method and no bare verify key. *(was test-verify-method)*
