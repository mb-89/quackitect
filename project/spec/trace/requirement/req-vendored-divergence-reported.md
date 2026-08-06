---
id: req-vendored-divergence-reported
type: "[[requirement]]"
statement: "When the engine loads over a vendored folder whose content differs from the shipped snapshot, the engine shall report every diverged path."
kind: functional
verify_method: test
breaks_if_removed: "A hand-edit under the engine folder hides until the next whole-folder update destroys it."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 1a
  - ".se/req-mine-v2.md: dependencies and the ship review (divergence is mechanically detected; diverged never flips silently)"
priority: could
---
