---
id: req-overlay-edit-serves-on-load
type: "[[requirement]]"
statement: "When a builder edits an overlay card, the engine shall serve the edited card at the next load with zero rebuild steps."
kind: functional
verify_method: test
breaks_if_removed: "Overlay authoring gains a build step, and stale compiled method serves after every edit."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 3
  - uc-vendor-and-overlay step 5
  - ".se/req-mine-v2.md: machine execution (compile-at-load, draft is truth; changes reach every iteration at its next load)"
priority: could
---
