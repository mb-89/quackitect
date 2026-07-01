---
id: test-engine-loc-untracked
type: test
statement: The workspace `.gitignore` excludes `.quack/engine.local` and any vendored engine binary; a simulated clone of the committed tree carries no absolute engine path and no engine binary.
verifies: [req-engine-loc-untracked]
class: executed
verify: selftest:stubs
killer: false
---
## Rationale (not load-bearing)
selftest:stubs checks the ignore rules and scans the committed set for leaked paths.
