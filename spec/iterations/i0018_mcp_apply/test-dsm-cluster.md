---
id: test-dsm-cluster
type: test
statement: On a two-clusters-plus-bridge fixture the algorithm separates the two clusters, layers them in bridge direction, and tears nothing; on a directed 3-cycle it tears exactly one edge.
class: executed
verify: selftest:dsm-cluster
killer: false
tests_red: exempt - the clustering algorithm and its known fixtures landed together as the feature was built; no separable red state was ever observable (adr-red-unobservable)
---
## Rationale (not load-bearing)
Verifies req-dsm-cluster on small known fixtures.
It asserts the clustering separates two obvious modules and never tears a clean bridge.
It asserts a cluster cycle is broken by exactly one tear.
