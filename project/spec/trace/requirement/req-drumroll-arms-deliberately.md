---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-drumroll-arms-deliberately
type: "[[requirement]]"
statement: When 5 presses land within the drumroll's window on a locked rung, the engine shall raise the autonomy to the top and arm emergency mode; 4 or fewer presses shall change nothing.
kind: functional
verify_method: test
breaks_if_removed: Full delegation is either one accidental click away, or unreachable from a locked rung at all.
breaks_how_badly: corrosive
refines:
  - uc-set-the-autonomy
source_refs:
  - reverse-engineered from tests/drumroll.test.ts
priority: should
---

## Detail

- Presses spread past the window do not accumulate.
- The count survives a press that lands while the rung is dark.
- The autonomy goes to the top BEFORE arming, so the arming is never below full.
- The button paints its armed state at once, without waiting for a poll.
