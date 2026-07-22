---
id: se.adr-terms-source-glossary
kind: decision
statement: The terms-before-use lint reads the glossary as its only term list. The check follows the glossary's growth, and no second list exists. A curated shadow list is rejected, since two places for one fact drift apart, and the verified prior art shows curated lists solve spelling, never ordering. The glossary's thinness is fixed by growing the glossary.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0019_strangers_book
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Pugh winner over the Vale-style vocabulary candidate (M3 fork B); DRY law applied to the term source.
