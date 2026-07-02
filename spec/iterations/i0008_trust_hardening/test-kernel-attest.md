---
id: test-kernel-attest
type: test
verifies: [req-kernel-selftest]
statement: The attest prev_hash chain verifies end-to-end from the migrated-null anchor, and a tampered middle event is detected.
class: executed
verify: selftest:kernel-attest
killer: false
---
