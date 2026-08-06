---
id: req-overlay-replaces-outright
type: "[[requirement]]"
statement: "When an overlay carries a rigor row with the same identity as an engine row, the compiled machine shall carry the overlay's row and zero copies of the engine's row."
kind: functional
verify_method: test
breaks_if_removed: "Replacement degrades to addition: both rows compile in, and the builder cannot remove any part of the engine's method."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 3a
priority: could
---
