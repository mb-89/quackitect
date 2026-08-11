---
id: req-reader-keeps-their-place
type: "[[requirement]]"
statement: While a person reads the panel, the engine shall change only what the last act touched, with zero pane resets, zero size changes and zero scroll jumps caused by unrelated acts.
kind: functional
verify_method: test
breaks_if_removed: Watching the walk means losing your place every time it moves, so nobody watches.
breaks_how_badly: crippling
refines:
  - uc-watch-the-walk-live
source_refs:
  - reverse-engineered from tests/mirror-contract.test.ts
priority: must
---

## Detail

- A machine switch carries the reader's open detail with it; a popped-out card opens on what it was showing and then holds still.
- Pane sizes are stored on release and restored on load; content never resizes the layout.
- The details pane is not rewritten when its content did not change.
- Only content that is genuinely gone may clear, and it says so in its place.
