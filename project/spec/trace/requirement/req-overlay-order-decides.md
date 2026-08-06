---
id: req-overlay-order-decides
type: "[[requirement]]"
statement: "While two or more overlay layers carry a card for the same identity, the resolution chain shall serve the card from the layer standing earliest in the declared order, identically on every load."
kind: functional
verify_method: test
breaks_if_removed: "The same repository resolves to different method content between loads, and nobody can say which card ran."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 4a
priority: could
---
