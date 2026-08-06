---
id: req-position-recomputed-at-reload
type: "[[requirement]]"
statement: "When the machine restarts after a reload, the engine shall recompute the walk's position from recorded evidence, restoring zero remembered positions."
kind: functional
verify_method: test
breaks_if_removed: "A remembered position survives a guidance change it no longer satisfies, and the walk stands where the corrected method never routed it."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 4
priority: must
---

## Detail

## Detail

- The recomputed position re-owes its readings, its evidence and its conditions. Each is re-earned after the restart.
- A pre-reload position is never restored from memory.
