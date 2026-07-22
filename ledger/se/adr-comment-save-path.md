---
id: se.adr-comment-save-path
kind: decision
statement: Save is in-place through the File System Access API where granted, and a download of the commented copy everywhere else; download-only is rejected for copy proliferation. The serializer rewrites the island block only, so an uncommented save is a byte-identical no-op.
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
The TiddlyWiki pattern. Owner accepted Chromium-first with fallback (2026-07-07).
