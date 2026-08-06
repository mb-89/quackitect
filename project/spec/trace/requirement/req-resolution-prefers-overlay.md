---
id: req-resolution-prefers-overlay
type: "[[requirement]]"
statement: "While an overlay provides a card for an identity, the resolution chain shall serve the overlay's card for that identity."
kind: functional
verify_method: test
breaks_if_removed: "The overlay is decorative: the engine's card serves even where the builder replaced it, so the vendor promise is false."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 4
priority: should
---

## Detail

## Detail

| situation at an identity | served card |
| --- | --- |
| an overlay carries it | the overlay's |
| no overlay carries it | the engine's |
| several overlay layers carry it | the layer standing earliest in the declared order (req-overlay-order-decides) |
