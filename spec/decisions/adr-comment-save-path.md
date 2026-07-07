---
id: adr-comment-save-path
type: adr
kind: architecture
adjudicated_by: user
statement: Save is in-place through the File System Access API where granted, and a download of the commented copy everywhere else; download-only is rejected for copy proliferation. The serializer rewrites the island block only, so an uncommented save is a byte-identical no-op.
class: review
killer: false
---
## Rationale (not load-bearing)
The TiddlyWiki pattern. Owner accepted Chromium-first with fallback (2026-07-07).
