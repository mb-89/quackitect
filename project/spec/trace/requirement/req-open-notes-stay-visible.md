---
id: req-open-notes-stay-visible
type: "[[requirement]]"
statement: The engine shall show every undrained note in the inbox count and the feed until a recorded disposition removes it.
kind: functional
verify_method: test
breaks_if_removed: Captured findings vanish from sight, and the inbox becomes a write-only hole.
refines:
  - uc-capture-a-stray
source_refs:
  - uc-capture-a-stray step 2
  - uc-capture-a-stray step 4
  - ".se/req-mine-v2.md: notes and the toll"
priority: should
---

## Detail

## Detail

- A capture raises the inbox count by one.
- A drain lowers it by one.
- The count and the feed agree at every read.
