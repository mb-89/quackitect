---
id: adr-build-identity
type: adr
adjudicated_by: human
statement: The cache build identity is the sha256 self-hash of the running binary, computed once per process. Chosen over a version constant: a forgotten bump would serve stale verdicts - the same failure class as the mtime ratchet.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
