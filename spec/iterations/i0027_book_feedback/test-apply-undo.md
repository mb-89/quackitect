---
id: test-apply-undo
type: test
statement: An applied manifest reverts byte-exactly with one undo command; a drifted file refuses the undo; the journal keeps only the last few applies.
class: executed
verify: selftest:apply-undo
killer: false
provenance:
  statement: authored at the b32 walk (owner ruling 2026-07-18)
  class: executed - the undo is mechanical
  killer: schema-default (false)
  verify: named at authoring
---
## Rationale (not load-bearing)
The guard covers the class: revert-exact, drift-refusal, and the bounded journal.
