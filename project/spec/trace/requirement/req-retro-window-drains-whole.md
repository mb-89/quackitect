---
id: req-retro-window-drains-whole
type: "[[requirement]]"
statement: "When a retro opens, the engine shall fix its window of pending notes and shall refuse the close while any note in that window lacks a disposition."
kind: functional
verify_method: test
breaks_if_removed: "The inbox becomes history: notes accumulate faster than a retro can be declared finished."
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 1
  - uc-drain-the-inbox step 3
  - uc-drain-the-inbox step 6
  - uc-drain-the-inbox guarantee
priority: must
---

## Detail

The window's two ends:

- When a retro opens, the engine shall record the set of pending note refs as the retro's window before it accepts the first drain.
- When a retro close is requested while any note in the retro's window lacks a disposition, the engine shall refuse the close and shall name each remaining note.
