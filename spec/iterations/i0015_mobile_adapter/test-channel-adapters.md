---
id: test-channel-adapters
type: test
statement: Every device channel is a zero-dependency adapter behind the ask seam.
class: executed
verify: selftest:adapter-zero-dep channel-seam ntfy-channel
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The adapter sources import the Go standard library only. *(was test-adapter-zero-dep)*
2. A dummy adapter behind the seam receives asks and returns answers with no ask-loop change. *(was test-channel-seam)*
3. The ntfy adapter sends an ask to the topic and picks the answer from since-polling. *(was test-ntfy-channel)*
