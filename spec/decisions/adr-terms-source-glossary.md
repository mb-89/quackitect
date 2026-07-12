---
id: adr-terms-source-glossary
type: adr
kind: architecture
decided_in: i0019_strangers_book
adjudicated_by: user
statement: The terms-before-use lint reads the glossary as its only term list - the check follows the glossary's growth and no second list exists. A curated shadow list is rejected: two places for one fact drift apart, and the verified prior art shows curated lists solve spelling, never ordering; the glossary's thinness is fixed by growing the glossary.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh winner over the Vale-style vocabulary candidate (M3 fork B); DRY law applied to the term source.
