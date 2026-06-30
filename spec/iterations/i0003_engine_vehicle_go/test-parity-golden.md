---
id: test-parity-golden
type: test
statement: A golden-output suite runs each command on a fixture vehicle. The Go output matches the Python baseline, including the report determinism root, byte for byte.
verifies: [req-behavior-parity, req-zero-dep-parse]
class: executed
verify: selftest:parity
killer: false
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the parity harness writes PARITY_OK. EXTEND during build to run the real Go-vs-Python golden diff. Covers the hand-rolled parser via parity.
