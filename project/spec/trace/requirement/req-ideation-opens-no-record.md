---
minted_in: i1
id: req-ideation-opens-no-record
type: "[[requirement]]"
statement: While ideation stands open, the engine shall open zero records and commit zero files.
kind: functional
verify_method: test
breaks_if_removed: Ideation grows records and commits, divergence stops being cheap, and nobody diverges before deciding.
breaks_how_badly: crippling
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 1
  - uc-diverge-before-deciding ext 6a
priority: should
weighs_against:
  - req-panel-shows-the-machine >
---

## Detail

## Detail

- A chosen option that needs a vehicle is routed to the front desk. Ideation seeds zero records itself.
