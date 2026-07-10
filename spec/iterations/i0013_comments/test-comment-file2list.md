---
id: test-comment-file2list
type: test
statement: note --file2list reads a commented copy back as deterministic, role-anonymous note candidates.
class: executed
verify: selftest:comment-privacy comment-readback
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The file2list output for a fixture copy with named authors carries the reader role and no author name. *(was test-comment-privacy)*
2. quack note --file2list on a commented fixture copy prints every comment as a note candidate (anchor, quote, thread, marks, status); two runs are byte-identical. *(was test-comment-readback)*
