---
minted_in: i1
id: req-divergence-order-on-record
type: "[[requirement]]"
statement: The engine shall record the order in which the problem, each option and the choice were entered.
kind: functional
verify_method: inspection
breaks_if_removed: Options back-filled after a made decision read exactly like real divergence, and ratification is undetectable.
breaks_how_badly: corrosive
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding ext 1a
priority: could
weighs_against:
  - req-single-option-recorded-as-finding > — undetectable ratification poisons every divergence; one unexamined option poisons one
---
