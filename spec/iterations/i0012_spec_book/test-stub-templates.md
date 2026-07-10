---
id: test-stub-templates
type: test
statement: start stubs instantiates the full template folder set including the spec skeleton.
class: executed
verify: selftest:stub-spec stubs-folders
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. start stubs into a bare workspace emits the nine chapter skeletons, the README, and the canned queries; a second run refuses to overwrite. *(was test-stub-spec)*
2. start stubs into a bare dir creates every template folder with its README; a second run overwrites nothing. *(was test-stubs-folders)*
