---
id: test-kernel-cone
type: test
verifies: [req-kernel-selftest]
statement: On baked linear, diamond, and shared-subtree fixture DAGs, changing one upstream reopens EXACTLY the expected set; fixed-seed property DAGs assert reopened equals blessed descendants of the change.
class: executed
verify: selftest:kernel-cone
killer: false
---
