---
id: req-dangling-overlay-reported
type: "[[requirement]]"
statement: "When an overlay entry names an identity the loaded engine version no longer provides, the pull shall report that identity as unresolved instead of serving the engine's default."
kind: functional
verify_method: test
breaks_if_removed: "An upstream rename silently swaps the builder's method for the engine's, and the walk runs the wrong cards unnoticed."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 6a
  - ".se/req-mine-v1.md: refusals and honesty (a cache miss is labeled distinctly from a failure)"
priority: should
---
