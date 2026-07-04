---
id: test-engine-ratchet
type: test
verifies: [req-engine-ratchet]
statement: Newer vendored source than the global binary triggers a rebuild before execution; a newer global binary runs as-is.
class: executed
verify: selftest:engine-ratchet
killer: false
---
