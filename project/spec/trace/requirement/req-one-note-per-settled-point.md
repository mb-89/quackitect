---
id: req-one-note-per-settled-point
type: "[[requirement]]"
statement: Where a point settles over a live discussion, the method shall demand one consolidated note at settlement instead of one note per exchange.
kind: functional
verify_method: inspection
breaks_if_removed: A live discussion sprays near-duplicate notes, and the retro drowns in fragments.
breaks_how_badly: abrasive
refines:
  - uc-capture-a-stray
source_refs:
  - uc-capture-a-stray ext 1b
priority: could
---
