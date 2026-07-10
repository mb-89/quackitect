---
id: test-chapter-placement
type: test
statement: Reader entry and guidance content sit in their owning chapters.
class: executed
verify: selftest:agent-guide-ch8 ch8-audience-subchapters
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The agent guide renders inside the guidance chapter and no reader chapter carries it. *(was test-agent-guide-ch8)*
2. The guidance chapter renders a subchapter for every audience class, including empty ones. *(was test-ch8-audience-subchapters)*
