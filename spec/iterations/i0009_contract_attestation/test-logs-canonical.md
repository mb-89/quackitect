---
id: test-logs-canonical
type: test
verifies: [req-logs-canonical]
statement: Two data-dir resolutions differing only in path casing or separator style yield the identical workspace slug.
class: executed
verify: selftest:logs-canonical
killer: false
---
