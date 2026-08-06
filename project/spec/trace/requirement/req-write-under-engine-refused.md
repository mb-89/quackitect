---
id: req-write-under-engine-refused
type: "[[requirement]]"
statement: "If a lane write targets a path under the engine's vendored folder, then the engine shall refuse the call with a remedy naming the overlay folder."
kind: functional
verify_method: test
breaks_if_removed: "One stray agent write under the engine folder silently turns the next update into a merge."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 1a
  - ".se/req-mine-v1.md: refusals and honesty (every refusal names the cause and the one recovery command)"
priority: should
---
