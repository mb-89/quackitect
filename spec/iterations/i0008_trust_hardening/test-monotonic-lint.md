---
id: test-monotonic-lint
type: test
verifies: [req-monotonic-lint]
statement: A fixture iteration whose M-n subtask skips the M-n-minus-1 gate is flagged by lint with nonzero exit; the correctly wired fixture passes.
class: executed
verify: selftest:monotonic-lint
killer: false
---
