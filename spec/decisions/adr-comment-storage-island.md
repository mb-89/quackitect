---
id: adr-comment-storage-island
decided_in: i0013_comments
type: adr
kind: architecture
adjudicated_by: user
statement: Comments live in ONE embedded JSON island in W3C Web Annotation vocabulary. The hidden-DOM school is rejected for breaking dom-static and idempotent save. The sidecar school is rejected for breaking the single-file law. The island is the only thing the save path rewrites and the only thing the read-back reads.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner decisions 2026-07-07; Pugh run in M4-decision.md. Tripwire: if field round-trips ever run through a synced folder instead of mail, re-weigh the sidecar.
