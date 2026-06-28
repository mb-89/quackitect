---
id: merkle-dag
statement: A check's hash folds in its upstream checks' hashes, so any change ripples to all downstream checks (a Merkle DAG; no consensus machinery).
depends_on: [input-hashing]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Transitive hashing makes 'green design on changed requirements' unrepresentable — but it must trigger SUSPECT, not failure.
