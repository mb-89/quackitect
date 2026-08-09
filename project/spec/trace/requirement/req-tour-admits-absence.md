---
id: req-tour-admits-absence
type: "[[requirement]]"
statement: If zero instances of a stop's kind exist, then the stop shall state the absence and show no invented example.
kind: functional
verify_method: test
breaks_if_removed: The tour invents records that do not exist; the newcomer's first lesson is a fabrication.
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery ext 4a
  - ".se/req-mine-v1.md: the mirror — book, report, hand-off"
priority: should
weighs_against:
  - req-desk-offers-a-tour >
---
