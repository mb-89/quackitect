---
id: test-derived-boards
type: test
statement: The book derives its boards, matrices, and figures from graph facts alone, rendering exceptions prominently.
class: executed
verify: selftest:block-tree-design facet-board fig-tables results-exception type-stakeholders
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The block-tree fixture renders design elements and their nesting, not chapter manifests. *(was test-block-tree-design)*
2. Fixture requirements with facets render a board counting per vocabulary value with a zero-count hole visible; a facet value outside the type layer's vocabulary refuses with an error; the counts carry the register filter hooks. *(was test-facet-board)*
3. The verification matrix and the stakeholder matrix render from the shipped base queries; the retired figure kinds refuse with a pointer to the query. *(was test-fig-tables)*
4. A fixture with one failing check and one waived check renders both prominently with a passing-count summary line. *(was test-results-exception)*
5. One class file exists per stakeholder class; every type file links only existing class files; the derived class set for a fixture project equals the union over its iterations' types. *(was test-type-stakeholders)*
