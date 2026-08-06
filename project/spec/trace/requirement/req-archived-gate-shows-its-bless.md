---
id: req-archived-gate-shows-its-bless
type: "[[requirement]]"
statement: "When an archived gate is opened, the engine shall show its rounds, its verdict, and the blessing hand with the day."
kind: functional
verify_method: demonstration
breaks_if_removed: "Who blessed a gate, in how many rounds, and when, becomes unrecoverable."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 5
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: should
---

## Detail

## Detail

The bless line of an archived gate carries:

- the count of rounds, each openable
- the verdict
- the blessing hand, as a role
- the channel that granted it
- the day of the bless
