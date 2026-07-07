---
id: req-migrate-layout
type: requirement
statement: When migrate-layout runs on a workspace whose spec still carries manifests or item notes in spec/trace, the engine shall move each to its template-mirroring home, refusing to overwrite and reporting every move.
class: review
killer: false
phase: [migration]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Owner ruling 2026-07-07: the spec mirrors the template. New workspaces seed the mirrored layout via start stubs; EXISTING workspaces convert through this determinizer - never through a shell script outside the engine (one zero-dependency binary drives every platform).
