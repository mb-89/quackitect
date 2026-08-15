---
minted_in: i1
id: req-view-writes-round-trip
type: "[[requirement]]"
statement: When a view control writes, the engine shall land the write in the view's own file so that the file parses again and the next render reads it back identically.
kind: functional
verify_method: test
breaks_if_removed: The view's shape lives in memory, dies with the session, and drifts from what other tools of the family read.
breaks_how_badly: crippling
refines:
  - uc-shape-the-view
source_refs:
  - reverse-engineered from tests/bases.test.ts and tests/baseui.test.ts
priority: must
---

## Detail

- Ticking, unticking, reordering, renaming, duplicating and removing all land in the file, each touching only its own key.
- The two halves — the one view and the all-views settings — are independent, and both survive an unrelated edit.
- A control never writes outside the vault, and never writes anything but a view file.
