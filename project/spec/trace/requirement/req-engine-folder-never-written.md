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
  - uc-vendor-and-overlay ext 1a
  - ".se/req-mine-v1.md: refusals and honesty (every refusal names the cause and the one recovery command)"
priority: should
---

## Detail

What the fence covers:

- If a lane write targets a path under the engine's vendored folder, then the engine shall refuse the call with a remedy naming the overlay folder.
