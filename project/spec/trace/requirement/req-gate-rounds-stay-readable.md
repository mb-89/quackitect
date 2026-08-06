---
id: req-gate-rounds-stay-readable
type: "[[requirement]]"
statement: "When a blessed gate is opened for reading, the engine shall show its rounds as they were filled, each round carrying the approving role and its channel."
kind: functional
verify_method: demonstration
breaks_if_removed: "Who approved a level, and in which round, is reconstructed from memory."
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 6
  - uc-trace-a-decision-to-its-origin guarantee
  - ".se/req-mine-v2.md: gates, offers and grants"
priority: should
---

## Detail

## Detail

Each round shows:

- the round's content as it was filled.
- the approving role.
- the channel that granted it.
- its order in the record.

A blessed round never rewrites.
