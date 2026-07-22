---
id: se.adr-comment-storage-island
kind: decision
statement: Comments live in ONE embedded JSON island in W3C Web Annotation vocabulary. The hidden-DOM school is rejected for breaking dom-static and idempotent save. The sidecar school is rejected for breaking the single-file law. The island is the only thing the save path rewrites and the only thing the read-back reads.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0013_comments
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: comment layer
---

## Rationale (not load-bearing)
Owner decisions 2026-07-07; Pugh run in M4-decision.md. Tripwire: if field round-trips ever run through a synced folder instead of mail, re-weigh the sidecar.
