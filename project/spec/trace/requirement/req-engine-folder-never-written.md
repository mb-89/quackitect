---
id: req-engine-folder-never-written
type: "[[requirement]]"
statement: "While serving a host repository, the engine shall write zero files under its own vendored folder."
kind: functional
verify_method: test
breaks_if_removed: "Run-time state under the engine folder is lost or merged at every whole-folder replacement."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - uc-vendor-and-overlay ext 1a
  - uc-vendor-and-overlay step 6
priority: should
---

## Detail

## Detail

Run-time artifacts land in the host's own folders, never under the engine's:

- call logs
- walk and record state
- evidence files
- builder overlay content
