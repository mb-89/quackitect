---
id: req-reload-restarts-clean
type: "[[requirement]]"
statement: When a reload is requested, the engine shall restart from the sources as they stand on disk and shall recompute the walk's position from recorded evidence.
kind: functional
verify_method: test
breaks_if_removed: A reload serves half-old content from a half-remembered position, which is worse than not reloading.
breaks_how_badly: crippling
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 3
  - ".se/req-mine-v2.md: v2-091 compile-at-load"
  - ".se/req-mine-v2.md: v2-004 hot reload"
  - uc-change-the-method-mid-walk step 4
  - uc-change-the-method-mid-walk guarantee
  - ".se/req-mine-v1.md: the ledger and truth"
  - uc-change-the-method-mid-walk step 5
  - uc-change-the-method-mid-walk ext 4a
  - ".se/req-mine-v2.md: v2-051 edits suspect dependents"
  - ".se/req-mine-v1.md: gates, blesses — evidence hash flips the gate suspect"
priority: must
---

## Detail

One restart, and everything it guarantees:

- When a reload is requested, the engine shall restart the machine from the sources as they stand on disk, serving zero content compiled before the reload.
- When the machine restarts after a reload, the engine shall recompute the walk's position from recorded evidence, restoring zero remembered positions.
- When a reload is requested, the engine shall record the pre-reload state of every governed tree before it restarts.
- When a state reopens after a reload, the engine shall keep every filled entry that still satisfies the corrected guidance standing unchanged.
- If a filled entry no longer satisfies the corrected guidance, then the engine shall mark it with what moved and shall delete nothing.
