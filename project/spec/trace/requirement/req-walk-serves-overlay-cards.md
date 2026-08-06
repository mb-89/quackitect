---
id: req-walk-serves-overlay-cards
type: "[[requirement]]"
statement: "When a walk reaches a state whose card the overlay replaced, the engine shall serve the overlay's card at that state."
kind: functional
verify_method: test
breaks_if_removed: "Resolution passes in isolation while the walk still hands agents the engine's cards, so the builder's method never runs."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 5
priority: could
---
