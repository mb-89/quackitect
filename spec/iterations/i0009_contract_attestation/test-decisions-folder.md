---
id: test-decisions-folder
type: test
verifies: [req-decisions-folder]
statement: A post-baseline decision node outside spec/decisions/ is flagged by lint; a grandfathered pre-baseline ADR is not.
class: executed
verify: selftest:decisions-folder
killer: false
---
