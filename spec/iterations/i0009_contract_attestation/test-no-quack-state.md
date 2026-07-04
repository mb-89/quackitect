---
id: test-no-quack-state
type: test
verifies: [req-no-quack-state]
statement: Evidence, gather, overlay, spike, report, and golden-root operations write only under the user data directory; the repository tree stays untouched.
class: executed
verify: selftest:data-dir-caches
killer: false
---
