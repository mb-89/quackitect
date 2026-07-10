---
id: test-book-trust
type: test
statement: The book renders its exact ledger truth - live state, stamped identity, drift flagged at ship.
class: executed
verify: selftest:book-drift book-honesty book-identity
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A committed book differing from a fresh render is flagged; regeneration over an unchanged spec is a no-op. *(was test-book-drift)*
2. A fixture with a SUSPECT node renders that node marked; a DONE node renders unmarked with its verdict metadata. *(was test-book-honesty)*
3. A rendered book carries the merkle root, the active iteration, and the engine version; the stamped root equals the live root at render time. *(was test-book-identity)*
