---
id: adr-build-identity
type: adr
adjudicated_by: human
statement: The cache build identity is the sha256 self-hash of the running binary, computed once per process. Chosen over a version constant: a forgotten bump would serve stale verdicts - the same failure class as the mtime ratchet.
class: review
killer: false
---
## Rationale (not load-bearing)
The verdict cache must invalidate whenever the engine changes.
A hand-kept version constant relies on a person remembering to bump it.
A forgotten bump then serves a stale verdict.
That repeats the mtime ratchet failure, where a fresh clone rebuilt backward.
The sha256 self-hash of the running binary changes on every rebuild, so it cannot be forgotten.
The cost is one file read and hash per process, memoized once.
