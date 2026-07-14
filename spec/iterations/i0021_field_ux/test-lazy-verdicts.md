---
id: test-lazy-verdicts
type: test
statement: In lazy mode a cache-missed coverage test returns not-verified WITHOUT executing (the run counter stays flat); in eager mode the same miss executes and records; a cached verdict answers identically in both modes.
class: executed
verify: selftest:lazy-verdicts
killer: false
---
