---
id: req-overlay-resolution
type: "[[requirement]]"
statement: "When a builder overlay carries a card for an identity the engine also ships, the engine shall serve the overlay's card at every point that identity is resolved."
kind: functional
verify_method: test
breaks_if_removed: "A builder's own method silently loses to the engine's, and layering becomes forking."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 4
  - uc-vendor-and-overlay ext 4a
  - uc-vendor-and-overlay ext 3a
  - uc-vendor-and-overlay step 5
  - uc-vendor-and-overlay step 3
  - uc-vendor-and-overlay step 5
  - ".se/req-mine-v2.md: machine execution (compile-at-load, draft is truth; changes reach every iteration at its next load)"
priority: should
---

## Detail

The resolution rule, in every place it binds:

- While an overlay provides a card for an identity, the resolution chain shall serve the overlay's card for that identity.
- While two or more overlay layers carry a card for the same identity, the resolution chain shall serve the card from the layer standing earliest in the declared order, identically on every load.
- When an overlay carries a rigor row with the same identity as an engine row, the compiled machine shall carry the overlay's row and zero copies of the engine's row.
- When a walk reaches a state whose card the overlay replaced, the engine shall serve the overlay's card at that state.
- When a builder edits an overlay card, the engine shall serve the edited card at the next load with zero rebuild steps.
