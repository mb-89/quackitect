---
id: test-connections-code
type: test
statement: Connections mode extends to code-derived designs and mint writes.
class: executed
verify: selftest:conn-code-designs mint-edge-mode
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A connection note between two code-derived design ids passes the strict endpoint guard. *(was test-conn-code-designs)*
2. In a connections-mode fixture workspace, a minted node carries no frontmatter edge keys and its edge lands in the connection lane; the strict referee accepts it. *(was test-mint-edge-mode)*
